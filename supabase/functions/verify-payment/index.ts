import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders, handleCorsPrelight } from "../_shared/cors.ts";
import { validateCartItem } from "../_shared/validation.ts";
import { checkRateLimit, getClientIP, rateLimitResponse } from "../_shared/rate-limit.ts";

// Rate limit config: 10 verification attempts per minute per IP
const RATE_LIMIT_CONFIG = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  keyPrefix: "verify",
};

// Maximum field lengths for sanitization
const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 255;
const MAX_PHONE_LENGTH = 20;
const MAX_ADDRESS_LENGTH = 300;
const MAX_CITY_LENGTH = 100;
const MAX_POSTAL_CODE_LENGTH = 10;
const MAX_NOTES_LENGTH = 500;

/**
 * Sanitize a string by trimming and removing potentially dangerous characters
 */
function sanitizeString(input: string | undefined | null, maxLength: number): string {
  if (!input) return "";
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, maxLength);
}

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPrelight(req);
  if (corsResponse) return corsResponse;
  
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Check rate limit
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(clientIP, RATE_LIMIT_CONFIG);
  
  if (!rateLimitResult.allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return rateLimitResponse(rateLimitResult, corsHeaders);
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      throw new Error("Service temporarily unavailable");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { sessionId, cartItems } = await req.json();

    // Validate session ID format
    if (!sessionId || typeof sessionId !== "string" || sessionId.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Validate cart items if provided
    if (cartItems) {
      if (!Array.isArray(cartItems) || cartItems.length > 100) {
        return new Response(
          JSON.stringify({ error: "Invalid cart data" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      for (const item of cartItems) {
        const itemError = validateCartItem(item);
        if (itemError) {
          return new Response(
            JSON.stringify({ error: "Invalid cart item data" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
      }
    }

    // Check if order already exists for this session (prevent duplicates)
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (existingOrder) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          orderId: existingOrder.id,
          paymentStatus: "paid"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Extract and sanitize metadata from Stripe session
    const metadata = session.metadata || {};
    const subtotal = parseFloat(metadata.subtotal || "0");
    const shippingCost = parseFloat(metadata.shippingCost || "0");
    const total = subtotal + shippingCost;

    // Sanitize all customer data before database insertion
    const sanitizedCustomerName = sanitizeString(metadata.customerName, MAX_NAME_LENGTH);
    const sanitizedCustomerEmail = sanitizeString(session.customer_email, MAX_EMAIL_LENGTH).toLowerCase();
    const sanitizedCustomerPhone = sanitizeString(metadata.customerPhone, MAX_PHONE_LENGTH);
    const sanitizedCity = sanitizeString(metadata.shippingCity, MAX_CITY_LENGTH);
    const sanitizedAddress = sanitizeString(metadata.shippingAddress, MAX_ADDRESS_LENGTH);
    const sanitizedPostalCode = sanitizeString(metadata.shippingPostalCode, MAX_POSTAL_CODE_LENGTH);
    const sanitizedNotes = sanitizeString(metadata.notes, MAX_NOTES_LENGTH) || null;

    // Create order in database with sanitized data
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        session_id: sessionId.substring(0, 100), // Limit session ID length
        status: "paid",
        payment_method: "card",
        subtotal: Math.max(0, Math.min(subtotal, 1000000)), // Reasonable bounds
        shipping_cost: Math.max(0, Math.min(shippingCost, 1000)), // Reasonable bounds
        total: Math.max(0, Math.min(total, 1001000)), // Reasonable bounds
        customer_name: sanitizedCustomerName,
        customer_email: sanitizedCustomerEmail,
        customer_phone: sanitizedCustomerPhone,
        shipping_address: {
          city: sanitizedCity,
          address: sanitizedAddress,
          postalCode: sanitizedPostalCode,
        },
        notes: sanitizedNotes,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order");
    }

    // Create order items with sanitized data
    if (cartItems && cartItems.length > 0) {
      const orderItems = cartItems.map((item: { productId: string; name: string; price: number; quantity: number }) => ({
        order_id: order.id,
        product_id: item.productId.substring(0, 100),
        product_name: sanitizeString(item.name, 200),
        product_price: Math.max(0, Math.min(item.price, 100000)),
        quantity: Math.max(1, Math.min(Math.floor(item.quantity), 100)),
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items error:", itemsError);
      }

      // Decrement product stock for each purchased item
      for (const item of cartItems) {
        const productId = item.productId?.substring(0, 100);
        const quantity = Math.max(1, Math.min(Math.floor(item.quantity || 1), 100));
        const size = item.size ? sanitizeString(item.size, 50) : null;
        const color = item.color ? sanitizeString(item.color, 50) : null;

        if (size && color) {
          // Decrement variant stock
          const { error: variantError } = await supabase.rpc("decrement_variant_stock", {
            p_product_id: productId,
            p_size: size,
            p_color: color,
            p_quantity: quantity,
          });

          if (variantError) {
            console.error("Variant stock decrement error:", variantError);
          }
        } else {
          // Decrement main product stock
          const { error: stockError } = await supabase.rpc("decrement_product_stock", {
            p_product_id: productId,
            p_quantity: quantity,
          });

          if (stockError) {
            console.error("Product stock decrement error:", stockError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderId: order.id,
        paymentStatus: session.payment_status 
      }),
      {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Payment verification error:", error);
    // Return sanitized error message
    return new Response(
      JSON.stringify({ error: "Payment verification failed. Please contact support." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

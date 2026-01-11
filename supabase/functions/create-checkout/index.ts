import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { getCorsHeaders, handleCorsPrelight } from "../_shared/cors.ts";
import { validateCheckoutData, validateCartItem, validateUrl } from "../_shared/validation.ts";
import { checkRateLimit, getClientIP, rateLimitResponse } from "../_shared/rate-limit.ts";

// Rate limit config: 5 checkout attempts per minute per IP
const RATE_LIMIT_CONFIG = {
  maxRequests: 5,
  windowMs: 60000, // 1 minute
  keyPrefix: "checkout",
};

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutRequest {
  items: CartItem[];
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: {
    city: string;
    address: string;
    postalCode: string;
  };
  notes?: string;
  successUrl: string;
  cancelUrl: string;
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
    if (!stripeKey) {
      console.error("Stripe secret key not configured");
      throw new Error("Payment service unavailable");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const body: CheckoutRequest = await req.json();
    const { items, customerEmail, customerName, customerPhone, shippingAddress, notes, successUrl, cancelUrl } = body;

    // Validate URLs
    if (!successUrl || !cancelUrl || !validateUrl(successUrl) || !validateUrl(cancelUrl)) {
      return new Response(
        JSON.stringify({ error: "Invalid redirect URLs" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Validate cart items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cart is empty" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Validate each cart item
    for (const item of items) {
      const itemError = validateCartItem(item);
      if (itemError) {
        return new Response(
          JSON.stringify({ error: `Invalid cart item: ${itemError.message}` }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }
    }

    // Validate customer data
    const validation = validateCheckoutData({
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      notes,
    });

    if (!validation.valid || !validation.sanitized) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid checkout data", 
          details: validation.errors.map(e => e.message).join(", ")
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const sanitized = validation.sanitized;

    // Calculate shipping cost (free over 100 BGN)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = subtotal >= 100 ? 0 : 6.99;

    // Create line items for Stripe (sanitize product names)
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "bgn",
        product_data: {
          name: item.name.substring(0, 200).replace(/[<>]/g, ""),
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if not free
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "bgn",
          product_data: {
            name: "Доставка Speedy",
            images: [],
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session with sanitized data
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      customer_email: sanitized.customerEmail,
      metadata: {
        customerName: sanitized.customerName,
        customerPhone: sanitized.customerPhone,
        shippingCity: sanitized.shippingAddress.city,
        shippingAddress: sanitized.shippingAddress.address,
        shippingPostalCode: sanitized.shippingAddress.postalCode,
        notes: sanitized.notes || "",
        subtotal: subtotal.toString(),
        shippingCost: shippingCost.toString(),
      },
      shipping_address_collection: {
        allowed_countries: ["BG"],
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
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
    console.error("Stripe checkout error:", error);
    // Return sanitized error message
    return new Response(
      JSON.stringify({ error: "Checkout failed. Please try again." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

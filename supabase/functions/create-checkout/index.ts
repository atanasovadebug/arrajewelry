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
  category?: string;
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
  shippingMethod?: "office" | "automat" | "address";
  notes?: string;
  discountCode?: string | null;
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
    const { items, customerEmail, customerName, customerPhone, shippingAddress, shippingMethod, notes, discountCode, successUrl, cancelUrl } = body;

    // Validate and apply discount code
    let discountPercent = 0;
    let discountType: "all" | "moissanite" | null = null;
    let discountLabel = "";

    if (discountCode) {
      const code = String(discountCode).trim().toLowerCase();
      if (code === "arra10") {
        discountPercent = 10;
        discountType = "all";
        discountLabel = "Отстъпка ARRA10 (−10%)";
      } else if (code === "radina15") {
        const hasMoissanite = items.some((item: CartItem) =>
          item.category?.toLowerCase() === "moissanite"
        );
        if (hasMoissanite) {
          discountPercent = 15;
          discountType = "moissanite";
          discountLabel = "Отстъпка RADINA15 (−15% Моасанит)";
        }
        // Invalid or inapplicable code is silently ignored server-side
      }
    }

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

    // EUR to BGN rate (fixed rate)
    const EUR_TO_BGN_RATE = 1.9558;
    const FREE_SHIPPING_THRESHOLD_EUR = 100;
    const SHIPPING_COST_OFFICE_BGN = 5;
    const SHIPPING_COST_AUTOMAT_BGN = 3.12;
    const SHIPPING_COST_ADDRESS_BGN = 10.80;
    
    // Calculate totals in BGN first
    const subtotalBGN = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Calculate discount in BGN
    let discountAmountBGN = 0;
    if (discountType === "all") {
      discountAmountBGN = subtotalBGN * (discountPercent / 100);
    } else if (discountType === "moissanite") {
      const moissaniteTotal = items
        .filter((item: CartItem) => item.category?.toLowerCase() === "moissanite")
        .reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
      discountAmountBGN = moissaniteTotal * (discountPercent / 100);
    }

    const discountedSubtotalBGN = subtotalBGN - discountAmountBGN;
    const freeShippingThresholdBGN = FREE_SHIPPING_THRESHOLD_EUR * EUR_TO_BGN_RATE;
    const baseShippingCostBGN = shippingMethod === "automat" ? SHIPPING_COST_AUTOMAT_BGN : shippingMethod === "address" ? SHIPPING_COST_ADDRESS_BGN : SHIPPING_COST_OFFICE_BGN;
    const shippingCostBGN = discountedSubtotalBGN >= freeShippingThresholdBGN ? 0 : baseShippingCostBGN;
    const shippingLabel = shippingMethod === "automat" ? "Доставка Speedy Автомат" : shippingMethod === "address" ? "Доставка до адрес (Speedy)" : "Доставка до офис (Speedy)";

    // Convert BGN prices to EUR for Stripe (BGN is no longer supported)
    const toEurCents = (bgnAmount: number) => Math.round((bgnAmount / EUR_TO_BGN_RATE) * 100);

    // Create line items for Stripe in EUR (sanitize product names)
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name.substring(0, 200).replace(/[<>]/g, ""),
          images: item.image && validateUrl(item.image) ? [item.image] : [],
        },
        unit_amount: toEurCents(item.price),
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if not free
    if (shippingCostBGN > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: shippingLabel,
            images: [],
          },
          unit_amount: toEurCents(shippingCostBGN),
        },
        quantity: 1,
      });
    }

    // Create a Stripe coupon for the discount if applicable
    let stripeCouponId: string | undefined;
    if (discountAmountBGN > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: toEurCents(discountAmountBGN),
        currency: "eur",
        name: discountLabel,
        duration: "once",
      });
      stripeCouponId = coupon.id;
    }

    // Create Stripe checkout session with sanitized data
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      ...(stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
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
        subtotalBGN: subtotalBGN.toString(),
        discountBGN: discountAmountBGN.toString(),
        discountCode: discountLabel || "",
        shippingCostBGN: shippingCostBGN.toString(),
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

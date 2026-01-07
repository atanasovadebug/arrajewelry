import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { sessionId, cartItems } = await req.json();

    if (!sessionId) {
      throw new Error("Missing session ID");
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Extract metadata
    const metadata = session.metadata || {};
    const subtotal = parseFloat(metadata.subtotal || "0");
    const shippingCost = parseFloat(metadata.shippingCost || "0");
    const total = subtotal + shippingCost;

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        session_id: sessionId,
        status: "paid",
        payment_method: "card",
        subtotal,
        shipping_cost: shippingCost,
        total,
        customer_name: metadata.customerName || "",
        customer_email: session.customer_email || "",
        customer_phone: metadata.customerPhone || "",
        shipping_address: {
          city: metadata.shippingCity || "",
          address: metadata.shippingAddress || "",
          postalCode: metadata.shippingPostalCode || "",
        },
        notes: metadata.notes || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order");
    }

    // Create order items
    if (cartItems && cartItems.length > 0) {
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items error:", itemsError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderId: order.id,
        paymentStatus: session.payment_status 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Payment verification error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

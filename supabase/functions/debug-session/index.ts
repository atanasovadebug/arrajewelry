import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id")!;
  const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items", "payment_intent"] });
  return new Response(JSON.stringify({
    id: s.id,
    livemode: s.livemode,
    created: new Date(s.created * 1000).toISOString(),
    payment_status: s.payment_status,
    status: s.status,
    amount_total: s.amount_total,
    currency: s.currency,
    // deno-lint-ignore no-explicit-any
    pi: typeof s.payment_intent === "object" ? { id: (s.payment_intent as any)?.id, status: (s.payment_intent as any)?.status } : s.payment_intent,
    line_items: s.line_items?.data.map((li) => ({ desc: li.description, qty: li.quantity, amount: li.amount_total })),
  }), { headers: { "Content-Type": "application/json" } });
});

-- Allow guests to view order items for their orders using session_id
CREATE POLICY "Guests can view their own order items via session_id"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND o.user_id IS NULL
      AND o.session_id IS NOT NULL
      AND o.session_id = (current_setting('request.headers', true)::json->>'x-session-id')
  )
);
-- Allow guests to view their own orders using session_id
CREATE POLICY "Guests can view their own orders via session_id"
ON public.orders
FOR SELECT
USING (
  user_id IS NULL
  AND session_id IS NOT NULL
  AND session_id = (current_setting('request.headers', true)::json->>'x-session-id')
);
-- Drop existing SELECT policies that allow session-based guest access
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;

-- Create restrictive SELECT policy for orders - ONLY authenticated users can read their own orders
-- Guest orders cannot be queried after creation (order confirmation shown from INSERT response)
CREATE POLICY "Users can read own orders"
ON public.orders
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND user_id = auth.uid()
);

-- Create restrictive SELECT policy for order_items - ONLY authenticated users can read their own order items
CREATE POLICY "Users can read own order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND auth.uid() IS NOT NULL
    AND orders.user_id = auth.uid()
  )
);
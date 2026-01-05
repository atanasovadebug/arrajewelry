-- Drop old permissive policies that still exist
DROP POLICY IF EXISTS "Order items accessible " ON public.order_items;
DROP POLICY IF EXISTS "Order items accessible" ON public.order_items;
DROP POLICY IF EXISTS "Cart items accessible by session " ON public.cart_items;
DROP POLICY IF EXISTS "Cart items accessible by session" ON public.cart_items;

-- Create proper cart_items policies
-- Cart is stored in localStorage, so database cart is not used for this app
-- But we'll still secure it in case it's used in the future

-- For cart_items: Since cart is client-side (localStorage), we can make these restrictive
-- If cart_items table is ever used, it should be session-based for guests

CREATE POLICY "Users can manage their own cart items"
ON public.cart_items
FOR ALL
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR (auth.uid() IS NULL AND session_id IS NOT NULL)
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR (auth.uid() IS NULL AND session_id IS NOT NULL)
);
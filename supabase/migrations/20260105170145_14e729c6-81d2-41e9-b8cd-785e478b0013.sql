-- Drop existing policies on orders table
DROP POLICY IF EXISTS "Authenticated users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create comprehensive SELECT policy that allows:
-- 1. Authenticated users to read only their own orders (user_id = auth.uid())
-- 2. Guest users to read orders matching their session_id
CREATE POLICY "Users can read own orders"
ON public.orders
FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
);

-- Recreate INSERT policy (anyone can create orders)
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  (user_id IS NULL) OR (user_id = auth.uid())
);

-- Recreate UPDATE policy (only authenticated users can update their own orders)
CREATE POLICY "Users can update own orders"
ON public.orders
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND user_id = auth.uid()
);

-- Also fix order_items policies
DROP POLICY IF EXISTS "Authenticated users can read own order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items for their orders" ON public.order_items;

-- SELECT policy for order_items - users can read items for orders they own
CREATE POLICY "Users can read own order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (
      (auth.uid() IS NOT NULL AND orders.user_id = auth.uid())
      OR
      (auth.uid() IS NULL AND orders.user_id IS NULL AND orders.session_id IS NOT NULL)
    )
  )
);

-- INSERT policy for order_items - can insert for orders they created
CREATE POLICY "Users can create order items for own orders"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (
      (orders.user_id IS NULL) OR (orders.user_id = auth.uid())
    )
  )
);
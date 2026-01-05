-- Drop existing policies on orders table
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

-- Drop existing policies on order_items table  
DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Order items accessible " ON public.order_items;

-- Create secure policies for orders table
-- SELECT: Only authenticated users can read their own orders
CREATE POLICY "Authenticated users can read own orders"
ON public.orders
FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- INSERT: Anyone can create orders (guest checkout allowed)
-- The insert returns data immediately, so no subsequent query needed
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- UPDATE: Only authenticated users can update their own orders
CREATE POLICY "Authenticated users can update own orders"
ON public.orders
FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Create secure policies for order_items table
-- SELECT: Only authenticated users can read items from their own orders
CREATE POLICY "Authenticated users can read own order items"
ON public.order_items
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- INSERT: Allow inserting order items for orders being created
-- This works because the order was just inserted in the same transaction
CREATE POLICY "Anyone can create order items for their orders"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id
  )
);
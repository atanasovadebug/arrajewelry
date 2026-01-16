-- Drop existing SELECT policies on orders and order_items (they were created as RESTRICTIVE instead of PERMISSIVE)
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- Recreate as PERMISSIVE policies (default) - these allow authenticated users to read their own data
-- Orders: Only authenticated users can read their own orders
CREATE POLICY "Users can read own orders" 
ON public.orders 
FOR SELECT 
USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

-- Orders: Admins can view all orders
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Order items: Only authenticated users can read their own order items
CREATE POLICY "Users can read own order items" 
ON public.order_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM orders 
  WHERE orders.id = order_items.order_id 
  AND auth.uid() IS NOT NULL 
  AND orders.user_id = auth.uid()
));

-- Order items: Admins can view all order items
CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));
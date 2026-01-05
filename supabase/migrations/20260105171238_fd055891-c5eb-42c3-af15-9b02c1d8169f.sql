-- Add admin SELECT policy for orders table
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add admin UPDATE policy for orders table (for order management)
CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add admin SELECT policy for order_items table
CREATE POLICY "Admins can view all order items"
ON public.order_items
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));
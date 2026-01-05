-- Drop the existing insecure policies
DROP POLICY IF EXISTS "Orders accessible by session or user " ON public.orders;
DROP POLICY IF EXISTS "Order items accessible " ON public.order_items;

-- Create proper RLS policies for orders table
-- Policy for reading orders - users can only read their own orders
CREATE POLICY "Users can read own orders"
ON public.orders
FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR session_id = current_setting('request.headers', true)::json->>'x-session-id'
);

-- Policy for inserting orders - anyone can place an order (checkout)
CREATE POLICY "Users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

-- Policy for updating orders - users can only update their own orders
CREATE POLICY "Users can update own orders"
ON public.orders
FOR UPDATE
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR session_id = current_setting('request.headers', true)::json->>'x-session-id'
);

-- No delete policy - orders should not be deleted by users

-- Create proper RLS policies for order_items table
-- Policy for reading order items - users can only read items from their own orders
CREATE POLICY "Users can read own order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (
      (auth.uid() IS NOT NULL AND orders.user_id = auth.uid())
      OR orders.session_id = current_setting('request.headers', true)::json->>'x-session-id'
    )
  )
);

-- Policy for inserting order items - only with valid order ownership
CREATE POLICY "Users can create order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id IS NULL OR orders.user_id = auth.uid()
      OR orders.session_id = current_setting('request.headers', true)::json->>'x-session-id'
    )
  )
);

-- No update or delete policies - order items should not be modified after creation
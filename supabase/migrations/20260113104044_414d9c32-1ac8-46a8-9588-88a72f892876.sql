-- Remove vulnerable guest SELECT policy from order_items table
DROP POLICY IF EXISTS "Guest users can view their order items via session" ON public.order_items;
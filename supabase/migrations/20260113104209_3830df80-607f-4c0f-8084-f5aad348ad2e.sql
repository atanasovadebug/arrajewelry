-- Remove all vulnerable guest SELECT policies that allow session_id enumeration
-- Guest order confirmation is handled server-side through verify-payment edge function

-- Drop the guest SELECT policy on orders table (exact name from current schema)
DROP POLICY IF EXISTS "Guests can view their own orders via session_id" ON public.orders;

-- Drop the guest SELECT policy on order_items table (exact name from current schema)
DROP POLICY IF EXISTS "Guests can view their own order items via session_id" ON public.order_items;
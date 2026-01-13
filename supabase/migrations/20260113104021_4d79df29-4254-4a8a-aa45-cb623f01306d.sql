-- Remove vulnerable guest SELECT policy that allows session_id enumeration attacks
-- Guest order confirmation is handled server-side through verify-payment edge function

-- Drop the vulnerable guest SELECT policy on orders table
DROP POLICY IF EXISTS "Guest users can view their own orders via session" ON public.orders;
-- Drop the old insecure policy that still exists (note the trailing space in the name)
DROP POLICY IF EXISTS "Orders accessible by session or user " ON public.orders;
DROP POLICY IF EXISTS "Orders accessible by session or user" ON public.orders;
-- Allow all operations on products table for now (admin functionality)
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;

CREATE POLICY "Products are publicly readable"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Allow product inserts"
ON public.products FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow product updates"
ON public.products FOR UPDATE
USING (true);

CREATE POLICY "Allow product deletes"
ON public.products FOR DELETE
USING (true);
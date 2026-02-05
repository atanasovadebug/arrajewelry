-- Function to decrement product stock
CREATE OR REPLACE FUNCTION public.decrement_product_stock(
  p_product_id uuid,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - p_quantity),
      updated_at = now()
  WHERE id = p_product_id;
END;
$$;

-- Function to decrement variant stock
CREATE OR REPLACE FUNCTION public.decrement_variant_stock(
  p_product_id uuid,
  p_size text,
  p_color text,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_variants
  SET stock = GREATEST(0, stock - p_quantity),
      updated_at = now()
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color;
END;
$$;
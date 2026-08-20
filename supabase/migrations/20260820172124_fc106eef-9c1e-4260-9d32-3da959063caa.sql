-- 1) Add 43, 44, 45 to available_sizes for all necklaces (sorted numerically, no duplicates)
UPDATE public.products p
SET specifications = jsonb_set(
      COALESCE(p.specifications, '{}'::jsonb),
      '{available_sizes}',
      (
        SELECT COALESCE(jsonb_agg(s ORDER BY (s)::numeric), '[]'::jsonb)
        FROM (
          SELECT DISTINCT x AS s
          FROM (
            SELECT jsonb_array_elements_text(COALESCE(p.specifications->'available_sizes', '[]'::jsonb)) AS x
            UNION
            SELECT unnest(ARRAY['43','44','45'])
          ) u
          WHERE x ~ '^[0-9]+(\.[0-9]+)?$'
        ) d
      ),
      true
    ),
    updated_at = now()
WHERE p.subcategory = 'necklaces';

-- 2) Create variants for the new sizes for each color the product offers
INSERT INTO public.product_variants (product_id, size, color, stock)
SELECT p.id, sz.size, c.color, 1
FROM public.products p
CROSS JOIN (VALUES ('43'), ('44'), ('45')) AS sz(size)
CROSS JOIN LATERAL (
  SELECT DISTINCT color FROM (
    SELECT jsonb_array_elements_text(COALESCE(p.specifications->'available_types', '[]'::jsonb)) AS color
    UNION
    SELECT v.color FROM public.product_variants v WHERE v.product_id = p.id
  ) t
  WHERE color IS NOT NULL AND color <> ''
) c
WHERE p.subcategory = 'necklaces'
  AND NOT EXISTS (
    SELECT 1 FROM public.product_variants ev
    WHERE ev.product_id = p.id AND ev.size = sz.size AND ev.color = c.color
  );
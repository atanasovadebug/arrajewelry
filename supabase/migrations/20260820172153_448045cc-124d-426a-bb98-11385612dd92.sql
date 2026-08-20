UPDATE public.products
SET specifications = jsonb_set(specifications, '{available_sizes}', '["one-size","43","44","45"]'::jsonb, true),
    updated_at = now()
WHERE id IN ('0f0bd4c1-8e04-453f-a2e8-9f1c18b2783d','2526eeab-14da-4fd8-a128-d585420ebe45');
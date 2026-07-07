UPDATE public.products SET category = 'NonRoot' WHERE name ILIKE '%non%root%' OR name ILIKE '%nonroot%' OR name ILIKE '%proxy%';
UPDATE public.products SET category = 'Root' WHERE (name ILIKE '%root%') AND (category IS NULL);
UPDATE public.products SET category = 'iOS' WHERE name ILIKE '%ios%' OR name ILIKE '%iphone%';
UPDATE public.products SET category = 'PC' WHERE name ILIKE '%pc%';
UPDATE public.products SET category = 'NonRoot' WHERE category IS NULL;

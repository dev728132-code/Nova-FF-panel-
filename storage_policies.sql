-- Ensure buckets exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('digital-products', 'digital-products', true),
  ('product-logos', 'product-logos', true),
  ('elite-growth', 'elite-growth', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for digital-products bucket
CREATE POLICY "Public read digital-products" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'digital-products');

CREATE POLICY "Authenticated users can insert digital-products" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'digital-products' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update digital-products" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'digital-products' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete digital-products" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'digital-products' AND auth.role() = 'authenticated');

-- Policies for product-logos bucket
CREATE POLICY "Public read product-logos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-logos');

CREATE POLICY "Authenticated users can insert product-logos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product-logos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product-logos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-logos' AND auth.role() = 'authenticated');

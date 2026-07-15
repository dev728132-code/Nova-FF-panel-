-- Create digital_products table
CREATE TABLE IF NOT EXISTS public.digital_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT,
  price NUMERIC NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  logo_path TEXT,
  file_path TEXT,
  file_name TEXT,
  file_size NUMERIC,
  file_type TEXT,
  badges TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  offer_enabled BOOLEAN DEFAULT false,
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.digital_products ENABLE ROW LEVEL SECURITY;

-- Create policies for digital_products
DO $$ BEGIN
  CREATE POLICY "Enable read access for all users on digital_products"
    ON public.digital_products
    FOR SELECT
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Enable insert for authenticated users on digital_products"
    ON public.digital_products
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Enable update for authenticated users on digital_products"
    ON public.digital_products
    FOR UPDATE
    USING (auth.role() = 'authenticated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Enable delete for authenticated users on digital_products"
    ON public.digital_products
    FOR DELETE
    USING (auth.role() = 'authenticated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Ensure buckets exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('digital-products', 'digital-products', true),
  ('product-logos', 'product-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for digital-products bucket
DO $$ BEGIN
  CREATE POLICY "Public read digital-products" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'digital-products');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert digital-products" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'digital-products' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can update digital-products" 
    ON storage.objects FOR UPDATE 
    USING (bucket_id = 'digital-products' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can delete digital-products" 
    ON storage.objects FOR DELETE 
    USING (bucket_id = 'digital-products' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Policies for product-logos bucket
DO $$ BEGIN
  CREATE POLICY "Public read product-logos" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'product-logos');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert product-logos" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'product-logos' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can update product-logos" 
    ON storage.objects FOR UPDATE 
    USING (bucket_id = 'product-logos' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can delete product-logos" 
    ON storage.objects FOR DELETE 
    USING (bucket_id = 'product-logos' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;


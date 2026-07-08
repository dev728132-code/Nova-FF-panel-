-- Fix schema for existing tables
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS product_key text;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS payment_status text;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS order_status text;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS amount numeric;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS utr_number text;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS screenshot_url text;

-- Create fund_requests table if not exists
CREATE TABLE IF NOT EXISTS public.fund_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    panel_name text,
    plan_name text,
    amount numeric NOT NULL,
    utr_number text NOT NULL,
    payment_method text NOT NULL DEFAULT 'upi',
    screenshot_url text,
    status text NOT NULL DEFAULT 'Pending',
    admin_note text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Elite Growth Products Table
CREATE TABLE IF NOT EXISTS public.elite_growth_products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    image_url text,
    features text[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Elite Growth Orders Table
CREATE TABLE IF NOT EXISTS public.elite_growth_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    product_id uuid REFERENCES public.elite_growth_products(id) NOT NULL,
    product_name text NOT NULL,
    amount numeric NOT NULL,
    utr_number text,
    screenshot_url text,
    payment_method text NOT NULL DEFAULT 'manual',
    payment_status text NOT NULL DEFAULT 'Pending',
    order_status text NOT NULL DEFAULT 'Pending',
    product_key text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Elite Growth Products
ALTER TABLE public.elite_growth_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active elite_growth_products" ON public.elite_growth_products
    FOR SELECT TO authenticated, anon
    USING (is_active = true OR auth.jwt() ->> 'email' IN ('dev7287132@gmail.com', 'dev728132@gmail.com'));

CREATE POLICY "Admin can modify elite_growth_products" ON public.elite_growth_products
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' IN ('dev7287132@gmail.com', 'dev728132@gmail.com'))
    WITH CHECK (auth.jwt() ->> 'email' IN ('dev7287132@gmail.com', 'dev728132@gmail.com'));

-- RLS for Elite Growth Orders
ALTER TABLE public.elite_growth_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own elite_growth_orders" ON public.elite_growth_orders
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' IN ('dev7287132@gmail.com', 'dev728132@gmail.com'));

CREATE POLICY "Users can insert their own elite_growth_orders" ON public.elite_growth_orders
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update elite_growth_orders" ON public.elite_growth_orders
    FOR UPDATE TO authenticated
    USING (auth.jwt() ->> 'email' IN ('dev7287132@gmail.com', 'dev728132@gmail.com'))
    WITH CHECK (auth.jwt() ->> 'email' IN ('dev7287132@gmail.com', 'dev728132@gmail.com'));

CREATE POLICY "Admin can delete elite_growth_orders" ON public.elite_growth_orders
    FOR DELETE TO authenticated
    USING (auth.jwt() ->> 'email' IN ('dev7287132@gmail.com', 'dev728132@gmail.com'));

-- Insert default Elite Growth Products
INSERT INTO public.elite_growth_products (name, price, description, image_url, is_active)
VALUES 
    ('1000+ Free Reel Bundle', 49, 'Access to 1000+ free reels', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('Content Owner Channel', 299, 'Premium content owner channel', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('YouTube Watchtime Mastery', 399, 'Mastering YouTube watchtime', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('USA Movie Uploading', 399, 'Guide for USA movie uploading', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('Copy Paste Master', 199, 'Copy paste mastering guide', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('Doremon & Shinchan Uploading', 299, 'Cartoon uploading guide', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('Lofi Song Uploading', 249, 'Lofi song uploading guide', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('Movie Explanation', 199, 'Movie explanation guide', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('AI Automation', 349, 'AI Automation secrets', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('Animation Like NYT & Cricket Video', 299, 'Animation video creation', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('KK Create All', 999, 'KK Create all access bundle', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('Other YouTube Resources', 149, 'Additional YouTube resources', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('Netflix Movie Uploading', 499, 'Netflix movie uploading guide', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('4000+ Watch Time', 499, '4000+ Watch time strategy', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('YouTube Copyright', 299, 'Avoiding YouTube copyright', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('USA Copy Paste & Movie Uploading', 399, 'USA content copy paste guide', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('Bigg Boss Uploading', 399, 'Bigg Boss episode uploading', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('TV Serial Uploading', 449, 'TV serial uploading secrets', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('CID Uploading', 449, 'CID episode uploading', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('Facebook Resources', 199, 'Facebook growth resources', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true),
    ('YouTube Creators', 249, 'YouTube creators resources', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', true);

NOTIFY pgrst, 'reload schema';

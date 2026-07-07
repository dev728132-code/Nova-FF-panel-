-- Run this script in your Supabase SQL Editor to set up the database schema

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  features jsonb,
  image text
);

CREATE TABLE IF NOT EXISTS public.plans (
  id text PRIMARY KEY,
  product_id text REFERENCES public.products(id) ON DELETE CASCADE,
  duration text NOT NULL,
  price numeric NOT NULL
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  active_panels integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id text REFERENCES public.products(id),
  product_name text,
  plan_duration text,
  amount numeric,
  payment_status text DEFAULT 'Pending',
  order_status text DEFAULT 'Pending',
  purchase_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expiry_date timestamp with time zone,
  payment_screenshot_url text
);

-- 2. Setup Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are viewable by everyone." ON public.plans FOR SELECT USING (true);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders." ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders." ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Set up Storage Bucket for Payment Screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('payment_screenshots', 'payment_screenshots', true) ON CONFLICT DO NOTHING;

-- Drop existing policies if any to avoid conflict when running multiple times
DROP POLICY IF EXISTS "Anyone can upload screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view screenshots" ON storage.objects;

CREATE POLICY "Anyone can upload screenshots" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment_screenshots');
CREATE POLICY "Anyone can view screenshots" ON storage.objects FOR SELECT USING (bucket_id = 'payment_screenshots');

-- 4. Create trigger to automatically create profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Seed initial data
INSERT INTO public.products (id, name, description, features, image) VALUES
('apk-mc-panel-ff-root-android', 'APK MC Panel FF Root Android', 'Ultimate VIP panel for rooted Android devices. Maximum features unlocked.', '["Auto Aim", "ESP (Wallhack)", "Anti-Ban Protection", "No Recoil", "High Damage"]', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop'),
('br-mod-ff-pc-version', 'BR Mod FF PC Version', 'Premium modification for PC emulators. Highly optimized for performance.', '["Auto Aim", "ESP (Wallhack)", "Anti-Ban Protection", "No Recoil", "High Damage", "Emulator Bypass", "Custom Crosshair"]', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165&auto=format&fit=crop'),
('br-mod-ff-root-android', 'BR Mod FF Root Android', 'Advanced BR Mod for rooted Android users with exclusive scripts.', '["Auto Aim", "ESP (Wallhack)", "Anti-Ban Protection", "No Recoil", "High Damage"]', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2070&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.plans (id, product_id, duration, price) VALUES
('plan_1d_apk', 'apk-mc-panel-ff-root-android', '1 Day', 65),
('plan_3d_apk', 'apk-mc-panel-ff-root-android', '3 Days', 90),
('plan_7d_apk', 'apk-mc-panel-ff-root-android', '7 Days', 170),
('plan_15d_apk', 'apk-mc-panel-ff-root-android', '15 Days', 320),
('plan_30d_apk', 'apk-mc-panel-ff-root-android', '30 Days', 700),
('plan_1d_brmod', 'br-mod-ff-pc-version', '1 Day', 65),
('plan_3d_brmod', 'br-mod-ff-pc-version', '3 Days', 90),
('plan_7d_brmod', 'br-mod-ff-pc-version', '7 Days', 170),
('plan_15d_brmod', 'br-mod-ff-pc-version', '15 Days', 320),
('plan_30d_brmod', 'br-mod-ff-pc-version', '30 Days', 700)
ON CONFLICT (id) DO NOTHING;

-- 6. Bypass Email Confirmation (Run this if you can't log in due to email confirmation)
-- Alternatively, go to Supabase Dashboard -> Authentication -> Providers -> Email -> Turn off "Confirm email"
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_user();

-- Added for manual payment verification
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utr_number text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_date text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_time text;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;

-- Run this script in your Supabase SQL Editor

-- 1. Modify Profiles Table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_until timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login timestamp with time zone;

-- 2. Create Login History Table
CREATE TABLE IF NOT EXISTS public.login_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    login_time timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    ip_address text,
    device text,
    browser text,
    location text
);

-- 3. Create Reseller Prices Table
CREATE TABLE IF NOT EXISTS public.reseller_prices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    reseller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id text REFERENCES public.plans(id) ON DELETE CASCADE,
    price numeric NOT NULL,
    UNIQUE(reseller_id, plan_id)
);

-- 4. Create Promo Codes Table
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    discount_percentage numeric,
    fixed_discount numeric,
    expiry_date timestamp with time zone,
    usage_limit integer,
    times_used integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Admin Notifications Table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Setup RLS for new tables
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own login history" ON public.login_history FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.reseller_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Resellers can view own prices" ON public.reseller_prices FOR SELECT USING (auth.uid() = reseller_id);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active promo codes" ON public.promo_codes FOR SELECT USING (is_active = true);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert notifications" ON public.admin_notifications FOR INSERT WITH CHECK (true);

-- 7. Add Admin RLS Policies (Checks email)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (auth.jwt() ->> 'email' IN ('dev7287132@gmail.com', 'dev728132@gmail.com'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin policies
DROP POLICY IF EXISTS "Admin can manage profiles" ON public.profiles;
CREATE POLICY "Admin can manage profiles" ON public.profiles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can view all login history" ON public.login_history;
CREATE POLICY "Admin can view all login history" ON public.login_history FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can manage reseller prices" ON public.reseller_prices;
CREATE POLICY "Admin can manage reseller prices" ON public.reseller_prices FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can manage promo codes" ON public.promo_codes;
CREATE POLICY "Admin can manage promo codes" ON public.promo_codes FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can manage notifications" ON public.admin_notifications;
CREATE POLICY "Admin can manage notifications" ON public.admin_notifications FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


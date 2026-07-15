-- Run this SQL in your Supabase SQL Editor to fix Reseller Prices

-- 1. Drop the foreign key constraint that blocks inserting dynamic plans
ALTER TABLE public.reseller_prices DROP CONSTRAINT IF EXISTS reseller_prices_plan_id_fkey;
ALTER TABLE public.reseller_prices DROP CONSTRAINT IF EXISTS reseller_prices_reseller_id_plan_id_key;

-- 2. Ensure we have the unique constraint to allow UPSERT
ALTER TABLE public.reseller_prices ADD CONSTRAINT reseller_prices_reseller_id_plan_id_key UNIQUE (reseller_id, plan_id);

-- 3. Update Row Level Security
ALTER TABLE public.reseller_prices ENABLE ROW LEVEL SECURITY;

-- 4. Recreate Admin Policies
DROP POLICY IF EXISTS "Admin can manage reseller prices" ON public.reseller_prices;
CREATE POLICY "Admin can manage reseller prices" ON public.reseller_prices FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Resellers can view own prices" ON public.reseller_prices;
CREATE POLICY "Resellers can view own prices" ON public.reseller_prices FOR SELECT USING (auth.uid() = reseller_id);

-- 5. Add an Admin insert policy for plans (just in case)
DROP POLICY IF EXISTS "Admin can manage plans" ON public.plans;
CREATE POLICY "Admin can manage plans" ON public.plans FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

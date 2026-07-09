-- Run this if you already created the reseller_prices table and get foreign key errors when saving prices for new products
ALTER TABLE public.reseller_prices DROP CONSTRAINT IF EXISTS reseller_prices_plan_id_fkey;

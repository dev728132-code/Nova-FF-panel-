-- Force add the unique constraint if it's missing
ALTER TABLE public.reseller_prices DROP CONSTRAINT IF EXISTS reseller_prices_reseller_id_plan_id_key;
ALTER TABLE public.reseller_prices ADD CONSTRAINT reseller_prices_reseller_id_plan_id_key UNIQUE (reseller_id, plan_id);

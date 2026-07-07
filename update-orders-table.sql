ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utr_number text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_date text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_time text;

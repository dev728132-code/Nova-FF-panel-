CREATE TABLE IF NOT EXISTS public.reseller_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid,
    user_id uuid,
    product_id text,
    duration text,
    payment_id text,
    api_response jsonb,
    purchase_time timestamp with time zone DEFAULT timezone('utc'::text, now()),
    delivery_data text,
    status text
);

ALTER TABLE public.reseller_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reseller orders" ON public.reseller_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage reseller orders" ON public.reseller_orders FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

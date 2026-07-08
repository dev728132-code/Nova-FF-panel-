-- 1. Ensure RLS allows Admin to update Elite Growth Orders
ALTER TABLE public.elite_growth_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can update elite_growth_orders" ON public.elite_growth_orders;
CREATE POLICY "Admin can update elite_growth_orders" ON public.elite_growth_orders
    FOR UPDATE TO authenticated
    USING (auth.jwt() ->> 'email' IN ('dev7287132@gmail.com', 'dev728132@gmail.com'))
    WITH CHECK (auth.jwt() ->> 'email' IN ('dev7287132@gmail.com', 'dev728132@gmail.com'));

-- 2. Optional: If you want to manually approve all currently pending Elite Growth orders via SQL, 
-- you can run the following command (uncomment to use):
-- UPDATE public.elite_growth_orders 
-- SET payment_status = 'Verified', order_status = 'Completed', product_key = 'Approved' 
-- WHERE payment_status = 'Pending';

-- 3. Ensure RLS allows Admin to update Fund Requests
ALTER TABLE public.fund_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can update all fund_requests" ON public.fund_requests;
CREATE POLICY "Admin can update all fund_requests" ON public.fund_requests
    FOR UPDATE TO authenticated
    USING (auth.jwt() ->> 'email' IN ('dev7287132@gmail.com', 'dev728132@gmail.com'))
    WITH CHECK (auth.jwt() ->> 'email' IN ('dev7287132@gmail.com', 'dev728132@gmail.com'));

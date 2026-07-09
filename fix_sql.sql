-- 1. Fix Reseller Prices Foreign Key
ALTER TABLE public.reseller_prices DROP CONSTRAINT IF EXISTS reseller_prices_plan_id_fkey;

-- 2. Fix Login History Insert Policy
DROP POLICY IF EXISTS "Users can insert login history" ON public.login_history;
CREATE POLICY "Users can insert login history" ON public.login_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Ensure Notifications Insert Policy
DROP POLICY IF EXISTS "Users can insert notifications" ON public.admin_notifications;
CREATE POLICY "Users can insert notifications" ON public.admin_notifications FOR INSERT WITH CHECK (true);

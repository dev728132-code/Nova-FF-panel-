import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://ugvgogigsvcmynpinhtg.supabase.co';
const FALLBACK_KEY = 'sb_publishable_OGph_ONuJ-puNBtvE0An3g_03FTXGgH';
const supabase = createClient(FALLBACK_URL, FALLBACK_KEY);

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: `
    ALTER TABLE public.reseller_prices DROP CONSTRAINT IF EXISTS reseller_prices_plan_id_fkey;
    ALTER TABLE public.reseller_prices DROP CONSTRAINT IF EXISTS reseller_prices_reseller_id_plan_id_key;
    ALTER TABLE public.reseller_prices ADD CONSTRAINT reseller_prices_reseller_id_plan_id_key UNIQUE (reseller_id, plan_id);
    
    DROP POLICY IF EXISTS "Admin can manage reseller prices" ON public.reseller_prices;
    CREATE POLICY "Admin can manage reseller prices" ON public.reseller_prices FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
    
    ALTER TABLE public.reseller_prices ENABLE ROW LEVEL SECURITY;
  `});
  console.log('Result:', error || 'Success', data);
}
run();

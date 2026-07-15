import { createClient } from '@supabase/supabase-js';
const FALLBACK_URL = 'https://ugvgogigsvcmynpinhtg.supabase.co';
const FALLBACK_KEY = 'sb_publishable_OGph_ONuJ-puNBtvE0An3g_03FTXGgH';
const supabase = createClient(FALLBACK_URL, FALLBACK_KEY);

async function run() {
  const { data: users, error: err1 } = await supabase.from('profiles').select('*').limit(1);
  const { data, error } = await supabase.from('reseller_prices').upsert([
    { reseller_id: '8910b8dc-43ec-4993-8cfb-665063076046', plan_id: 'plan_1d_apk', price: 99 }
  ], { onConflict: 'reseller_id,plan_id' }).select();
  console.log('Result:', data, error);
}
run();

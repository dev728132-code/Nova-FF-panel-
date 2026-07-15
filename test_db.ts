import { createClient } from '@supabase/supabase-js';
const FALLBACK_URL = 'https://ugvgogigsvcmynpinhtg.supabase.co';
const FALLBACK_KEY = 'sb_publishable_OGph_ONuJ-puNBtvE0An3g_03FTXGgH';
const supabase = createClient(FALLBACK_URL, FALLBACK_KEY);

async function run() {
  const { data: plans } = await supabase.from('plans').select('*');
  console.log('Plans:', plans?.length);
}
run();

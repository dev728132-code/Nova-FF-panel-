import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function run() {
  const { data, error } = await supabase.from('elite_growth_products').insert({
    name: 'SAN GROW VIP METHODS',
    description: 'Unlock the Ultimate Premium Digital Growth Collection featuring AI Tools, Automation Resources, Exclusive Methods, Growth Strategies, and Lifetime Updates.',
    price: 600,
    image_url: 'https://images.unsplash.com/photo-1614064641913-6b71f3016345?w=800&q=80',
    features: [
      'Lifetime Access',
      'Premium AI Tools',
      'Automation Resources',
      'Exclusive Digital Growth Methods',
      'Regular New Updates',
      'VIP Members-Only Resources',
      'Save Thousands on Premium Subscriptions',
      'Instant Access After Payment',
      'Beginner & Advanced Friendly',
      'High-Quality Digital Resources'
    ],
    is_active: true
  });
  if (error) console.error('Error inserting', error);
  else console.log('Successfully inserted VIP product');
}
run();

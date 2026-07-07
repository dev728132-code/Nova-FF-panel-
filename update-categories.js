import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: products } = await supabase.from('products').select('*');
  for (const product of products) {
    let category = 'Other';
    const lowerName = product.name.toLowerCase();
    
    // Assign EXACT category string based on name
    if (lowerName.includes('non root') || lowerName.includes('non-root') || lowerName.includes('nonroot') || lowerName.includes('proxy')) {
      category = 'NonRoot';
    } else if (lowerName.includes('root') && !lowerName.includes('non')) {
      category = 'Root';
    } else if (lowerName.includes('ios') || lowerName.includes('iphone')) {
      category = 'iOS';
    } else if (lowerName.includes('pc') || lowerName.includes('steam') || lowerName.includes('emulator')) {
      category = 'PC';
    } else {
      category = 'NonRoot'; // Defaulting others to NonRoot or just leave as is, maybe based on name
    }

    console.log(`Updating ${product.name} to ${category}`);
    await supabase.from('products').update({ category }).eq('id', product.id);
  }
}
run();

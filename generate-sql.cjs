const fs = require('fs');
const { v4: uuidv4 } = require('crypto'); // not available? Just use simple IDs.

const data = `
💥 Drip Client NON ROOT 💥
━━━━━━━━━━━━━━━━━━━━━━
1 Days   ₹80.00
3 Days  ₹190.00
7 Days  ₹350.00
15 Days  ₹630.00
30 Days  ₹900.00

💥 Drip Client PROXY 💥
━━━━━━━━━━━━━━━━━━━━━━
1 Days   ₹80.00
3 Days  ₹190.00
7 Days  ₹350.00
15 Days  ₹630.00
30 Days  ₹900.00

━━━━━━━━━━━━━━━━━━━━━━
💥 HG CHEATS Non ROOT💥
━━━━━━━━━━━━━━━━━━━━━━
1 Days   ₹90.00
7 Days   ₹350.00
10 Days  ₹400.00
30 Days  ₹830.00
  
━━━━━━━━━━━━━━━━━━━━━━
💥 HG APK PROXY💥
━━━━━━━━━━━━━━━━━━━━━━
1 Days   ₹90.00
7 Days   ₹350.00
10 Days  ₹400.00
30 Days  ₹830.00

━━━━━━━━━━━━━━━━━━━━━━
💥  Prime Hook Non root 💥
━━━━━━━━━━━━━━━━━━━━━━
1 Days   ₹80.00
3 Days   ₹149.40
7 Days   ₹319.50
10 Days  ₹349.20
   
━━━━━━━━━━━━━━━━━━━━━━
💥 PatoTeam NON ROOT💥
━━━━━━━━━━━━━━━━━━━━━━
1 Day ₹150.00
3 Days ₹220.00
7 Days ₹360.00
15 Days ₹620.00
30 Days ₹1030.00

━━━━━━━━━━━━━━━━━━━━━━
💥 GHOST ELITE STEEMER ROOT💥
━━━━━━━━━━━━━━━━━━━━━━
1 Days     ₹90.00
10 Days   ₹400.00
20 Days   ₹750.00
30 Days    ₹999.00

━━━━━━━━━━━━━━━━━━━━━━
💥 BR MOD  ROOT 💥
━━━━━━━━━━━━━━━━━━━━━━
1 Days     ₹80.00
7 Days     ₹350.00
15 Days   ₹650.00
30 Days   ₹999.00 

━━━━━━━━━━━━━━━━━━━━━━
💥 HIKARI MOD ROOT 💥
━━━━━━━━━━━━━━━━━━━━━━
3 Days     ₹150.00
7 Days     ₹300.00
15 Days   ₹650.00
30 Days   ₹1100.00

━━━━━━━━━━━━━━━━━━━━━━
💥 XYZ CHEATS SAFE ROOT 💥
━━━━━━━━━━━━━━━━━━━━━━
1 Days     ₹150.00
7 Days     ₹350.00
15 Days   ₹650.00
30 Days   ₹999.00

━━━━━━━━━━━━━━━━━━━━━━
💥HEX BLADE FF Root💥
━━━━━━━━━━━━━━━━━━━━━━
1 Days    ₹80.00
7 Days    ₹300.00
15 Days  ₹550.00
30 Days  ₹999.00

━━━━━━━━━━━━━━━━━━━━━━
💥 NEO STRIKE Root💥
━━━━━━━━━━━━━━━━━━━━━━
1 Days   ₹80.00
3 Days    ₹150.00
7 Days    ₹300.00
14 Days  ₹550.00

━━━━━━━━━━━━━━━━━━━━━━
💥 HAXX-CKER PRO Root 💥
━━━━━━━━━━━━━━━━━━━━━━
10 Days   ₹550.00
20 Days   ₹1100.00
30 Days   ₹1800.00

━━━━━━━━━━━━━━━━━━━━━━
💥 Reaper x Pro Root 💥
━━━━━━━━━━━━━━━━━━━━━━
10 Days   ₹350.00

━━━━━━━━━━━━━━━━━━━━━━
💥 DRIP CLINT PC AIM KILL💥
━━━━━━━━━━━━━━━━━━━━━━
1 Days    ₹150.00
7 Days    ₹450.00
15 Days  ₹860.00
30 Days  ₹1150.00

━━━━━━━━━━━━━━━━━━━━━━
💥 BR MOD PC AIM KILL💥
━━━━━━━━━━━━━━━━━━━━━━
1 Days    ₹120.00
10 Days  ₹550.00
30 Days  ₹1050.00

━━━━━━━━━━━━━━━━━━━━━━
💥 Esgin Gbox Certificate iOs💥
━━━━━━━━━━━━━━━━━━━━━━
30 Days Validity  ₹550.00

━━━━━━━━━━━━━━━━━━━━━━
💥 ios Fluorite 💥
━━━━━━━━━━━━━━━━━━━━━━
1 Days      ₹400.00
7 Days      ₹1349.00
30 Days   ₹2249.00

━━━━━━━━━━━━━━━━━━━━━━
💥 MIGUL iPhone ios 💥
━━━━━━━━━━━━━━━━━━━━━━
Basic....!! 
1 Days   ₹300.00
7 Days    ₹600.00
30 Days  ₹1500.00

Pro....!! 
1 Days Pro   ₹400.00
7 Days Pro   ₹1000.00
30 Days Pro  ₹2250.00
`;

let currentProduct = null;
const products = [];
const plans = [];

const lines = data.split('\n');

for (let line of lines) {
  line = line.trim();
  if (!line) continue;
  if (line.includes('━━━━━━━━━━━━━━━━━━━━━━')) continue;
  if (line.startsWith('💥')) {
    // New product
    const name = line.replace(/💥/g, '').trim();
    if (name.includes('MIGUL')) {
      products.push({
        id: 'migul-iphone-ios-basic',
        name: 'MIGUL iPhone ios Basic',
        description: 'Premium bypass and mod for iOS.',
        features: '["Auto Aim", "ESP", "Anti-Ban"]',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop'
      });
      products.push({
        id: 'migul-iphone-ios-pro',
        name: 'MIGUL iPhone ios Pro',
        description: 'Ultimate bypass and mod for iOS.',
        features: '["Auto Aim", "ESP", "Anti-Ban", "No Recoil"]',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop'
      });
      currentProduct = 'migul';
    } else {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      currentProduct = id;
      products.push({
        id,
        name,
        description: `Premium ${name} tool with the best features.`,
        features: '["Auto Aim", "ESP", "Anti-Ban", "No Recoil"]',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop'
      });
    }
  } else if (line.includes('₹')) {
    if (currentProduct === 'migul') {
      if (line.toLowerCase().includes('pro')) {
        const parts = line.split('₹');
        const duration = parts[0].replace('Pro', '').trim();
        const price = parts[1].trim();
        plans.push({
          id: `plan-migul-pro-${duration.replace(/\s+/g, '-').toLowerCase()}`,
          product_id: 'migul-iphone-ios-pro',
          duration: duration,
          price: price
        });
      } else {
        const parts = line.split('₹');
        const duration = parts[0].trim();
        const price = parts[1].trim();
        plans.push({
          id: `plan-migul-basic-${duration.replace(/\s+/g, '-').toLowerCase()}`,
          product_id: 'migul-iphone-ios-basic',
          duration: duration,
          price: price
        });
      }
    } else {
      const parts = line.split('₹');
      const duration = parts[0].trim();
      const price = parts[1].trim();
      plans.push({
        id: `plan-${currentProduct}-${duration.replace(/\s+/g, '-').toLowerCase()}`,
        product_id: currentProduct,
        duration: duration,
        price: price
      });
    }
  }
}

let sql = `-- Run this in Supabase SQL Editor to update your products\n`;
sql += `DELETE FROM public.plans;\n`;
sql += `DELETE FROM public.products;\n\n`;

sql += `INSERT INTO public.products (id, name, description, features, image) VALUES\n`;
const productValues = products.map(p => `('${p.id}', '${p.name}', '${p.description}', '${p.features}', '${p.image}')`);
sql += productValues.join(',\n') + ';\n\n';

sql += `INSERT INTO public.plans (id, product_id, duration, price) VALUES\n`;
const planValues = plans.map(p => `('${p.id}', '${p.product_id}', '${p.duration}', ${p.price})`);
sql += planValues.join(',\n') + ';\n';

fs.writeFileSync('update-products.sql', sql);

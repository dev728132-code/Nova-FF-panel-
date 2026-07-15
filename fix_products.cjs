const fs = require('fs');

let content = fs.readFileSync('src/data/products.ts', 'utf8');

// We want to replace the `plans: [...]` for each product to standard 5 plans.
// To do this reliably, we can parse the TypeScript if we strip types, or just use regex carefully.
// Wait, we can rewrite the entire products array.

const productsFile = `import { Product } from '../types';

export const NEW_PRODUCTS: Product[] = [
  {
    id: "apk-mc-panel-ff-root-android",
    name: "APK MC Panel FF (Root Android)",
    category: "Root",
    description: "Premium APK MC Panel for rooted Android devices. Includes auto aim, ESP, and advanced protection bypass.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "br-mod-ff-root-android",
    name: "BR MOD FF (Root Android)",
    category: "Root",
    description: "Premium BR MOD FF for rooted Android devices. Seamless ESP, robust anti-ban protection, and clean UI.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "br-mod-ff-pc-version",
    name: "BR MOD FF (PC Version)",
    category: "PC",
    description: "Premium BR MOD FF for PC. Extreme accuracy with zero recoil, perfect for competitive setups.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "hg-cheats-non-root",
    name: "HG CHEATS (Non-Root)",
    category: "NonRoot",
    description: "Premium HG CHEATS (Non-Root) with virtual space compatibility and safe injection method.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "hg-apk-proxy",
    name: "HG APK PROXY (Safe Inject)",
    category: "NonRoot",
    description: "Premium HG APK PROXY with custom routing and local safe injection to avoid detection.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "prime-hook-non-root",
    name: "PRIME HOOK (Non-Root VIP)",
    category: "NonRoot",
    description: "Premium PRIME HOOK (Non-Root VIP) featuring high performance memory edits and anti-cheat bypass.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "patoteam-non-root",
    name: "PatoTeam NON-ROOT PRO",
    category: "NonRoot",
    description: "Premium PatoTeam NON-ROOT PRO toolset with exclusive ESP overlays and tracking.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "ghost-elite-steemer-root",
    name: "GHOST ELITE STEEMER (Root)",
    category: "Root",
    description: "Premium GHOST ELITE STEEMER (Root) providing root-level memory manipulation for flawless aim.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "br-mod-root",
    name: "BR MOD VIP (Root)",
    category: "Root",
    description: "Premium BR MOD VIP (Root) for ultimate performance on rooted Android systems.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "hikari-mod-root",
    name: "HIKARI PRO MOD (Root)",
    category: "Root",
    description: "Premium HIKARI PRO MOD (Root) with stealth injection and automated safety bypass.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "xyz-cheats-safe-root",
    name: "XYZ CHEATS (Safe Root)",
    category: "Root",
    description: "Premium XYZ CHEATS (Safe Root) with robust anti-cheat defense evasion features.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "hex-blade-ff-root",
    name: "HEX BLADE FF (Root)",
    category: "Root",
    description: "Premium HEX BLADE FF (Root) mod for high responsiveness and precise aim customization.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "neo-strike-root",
    name: "NEO STRIKE ELITE (Root)",
    category: "Root",
    description: "Premium NEO STRIKE ELITE (Root) featuring smooth aim-tracking and visual helper mods.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "haxx-cker-pro-root",
    name: "HAXX-CKER PRO (Root)",
    category: "Root",
    description: "Premium HAXX-CKER PRO (Root) - highly configured package for competitive matches.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "reaper-x-pro-root",
    name: "REAPER X PRO (Root)",
    category: "Root",
    description: "Premium REAPER X PRO (Root) designed for specialized battle royale settings.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "drip-clint-pc-aim-kill",
    name: "DRIP CLIENT PC (Aim & Kill)",
    category: "PC",
    description: "Premium DRIP CLIENT PC (Aim & Kill) engineered with flawless Windows client hook controls.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "br-mod-pc-aim-kill",
    name: "BR MOD PC (Aim Master)",
    category: "PC",
    description: "Premium BR MOD PC (Aim Master) optimization utilities with real-time target visualization.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "esgin-gbox-certificate-ios",
    name: "Esgin Gbox iOS Certificate",
    category: "iOS",
    description: "Premium Esgin Gbox iOS Certificate providing instant device profiling and app installation.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1510519138101-570d1dca3d66?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "ios-fluorite",
    name: "iOS Fluorite Premium",
    category: "iOS",
    description: "Premium iOS Fluorite Premium system with custom IPA injection and device protection.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "migul-iphone-ios-basic",
    name: "MIGUL iPhone iOS Basic",
    category: "iOS",
    description: "Premium bypass and mod for iOS. Designed with essential security modules.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "migul-iphone-ios-pro",
    name: "MIGUL iPhone iOS Pro",
    category: "iOS",
    description: "Ultimate high fidelity bypass and custom aim assist mod customized for iOS users.",
    features: ["Auto Aim", "ESP", "Anti-Ban", "No Recoil"],
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop"
  }
];

// Add standardized plans to all products
NEW_PRODUCTS.forEach(p => {
  p.plans = [
    { id: \`plan-\${p.id}-1d\`, duration: "1 Day", price: 100 },
    { id: \`plan-\${p.id}-3d\`, duration: "3 Days", price: 250 },
    { id: \`plan-\${p.id}-7d\`, duration: "7 Days", price: 500 },
    { id: \`plan-\${p.id}-15d\`, duration: "15 Days", price: 900 },
    { id: \`plan-\${p.id}-30d\`, duration: "30 Days", price: 1500 }
  ];
});
`;

fs.writeFileSync('src/data/products.ts', productsFile);
console.log("Updated products.ts");

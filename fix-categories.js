import fs from 'fs';

let content = fs.readFileSync('src/data/products.ts', 'utf8');

content = content.replace(/name:\s*"([^"]+)",/g, (match, name) => {
  let category = 'Other';
  const lowerName = name.toLowerCase();
  if (lowerName.includes('non root') || lowerName.includes('non-root') || lowerName.includes('nonroot') || lowerName.includes('proxy')) {
    category = 'NonRoot';
  } else if (lowerName.includes('root') && !lowerName.includes('non')) {
    category = 'Root';
  } else if (lowerName.includes('ios') || lowerName.includes('iphone')) {
    category = 'iOS';
  } else if (lowerName.includes('pc') || lowerName.includes('steam') || lowerName.includes('emulator')) {
    category = 'PC';
  } else {
    category = 'NonRoot';
  }
  return `name: "${name}",\n    category: "${category}",`;
});

fs.writeFileSync('src/data/products.ts', content);

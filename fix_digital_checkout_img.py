import re

with open('src/pages/DigitalCheckout.tsx', 'r') as f:
    content = f.read()

img_regex = r"<img src=\{product\.image\} alt=\{product\.name\} className=\"w-20 h-20 rounded-lg object-cover\" />"
replacement = """{product.logo_path ? (
                  <div className="w-20 h-20 rounded-lg object-cover overflow-hidden"><CheckoutLogo path={product.logo_path} /></div>
                ) : (
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0"><PlaceholderThumbnail name={product.name} size="sm" /></div>
                )}"""

content = re.sub(img_regex, replacement, content)

placeholder_component = """
function PlaceholderThumbnail({ name, size = 'sm' }: { name: string, size?: 'sm' | 'lg' }) {
  const words = name.split(' ');
  const initials = words.slice(0, 2).map(w => w[0]).join('').toUpperCase().substring(0, 2);
  
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-950 flex flex-col items-center justify-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent opacity-40"></div>
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:4px_4px]"></div>

      {size === 'sm' ? (
        <span className="font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-100 to-gray-500 z-10 drop-shadow-lg">{initials}</span>
      ) : (
        <>
          <span className="font-black text-3xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-100 to-gray-500 z-10 drop-shadow-lg mb-1">{initials}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest z-10 px-2 text-center truncate w-full">{name}</span>
        </>
      )}
    </div>
  );
}
"""

if "PlaceholderThumbnail" not in content:
    content += "\n" + placeholder_component

with open('src/pages/DigitalCheckout.tsx', 'w') as f:
    f.write(content)


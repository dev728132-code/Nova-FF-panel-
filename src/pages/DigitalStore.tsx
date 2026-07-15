import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DigitalProduct } from '../types';
import { motion } from 'motion/react';
import { Package, Search, Star, Zap, TrendingUp, Flame, Tag, ShoppingCart } from 'lucide-react';
import { useScrollTop } from '../hooks';
import { useNavigate } from 'react-router-dom';

export function DigitalStore() {
  useScrollTop();
  const navigate = useNavigate();
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('digital_products')
      .select('*')
      .eq('status', 'active')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (data) setProducts(data);
    setLoading(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-white mb-4"
          >
            Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Store</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Premium digital products, templates, and tools.
          </motion.p>
        </div>

        <div className="mb-8 relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <span className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin inline-block"></span>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-gray-900 border ${product.is_pinned ? 'border-orange-500' : 'border-gray-800'} rounded-3xl p-6 relative overflow-hidden group flex flex-col`}
              >
                {product.is_pinned && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10 flex items-center gap-1 shadow-lg shadow-orange-500/20">
                    <Star className="w-3 h-3 fill-current" /> PINNED
                  </div>
                )}
                
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shrink-0 border border-gray-800 overflow-hidden shadow-lg">
                     {product.logo_path ? (
                       <ProductLogo path={product.logo_path} />
                     ) : (
                       <PlaceholderThumbnail name={product.name} size="sm" />
                     )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{product.name}</h3>
                    {product.category && (
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{product.category}</span>
                    )}
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-3">
                  {product.short_description}
                </p>

                {/* Badges */}
                {product.badges && product.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {product.badges.map(badge => (
                      <BadgeIcon key={badge} badge={badge} />
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-6 border-t border-gray-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">
                        ₹{product.offer_enabled && product.discount_type === 'percentage' ? (product.price - (product.price * (product.discount_value || 0) / 100)).toFixed(2) : product.offer_enabled && product.discount_type === 'flat' ? (product.price - (product.discount_value || 0)).toFixed(2) : product.price}
                      </span>
                      {product.offer_enabled && (
                        <span className="text-gray-500 line-through text-sm font-semibold">₹{product.price}</span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/digital-store/checkout', { state: { product } })}
                    className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-orange-500/20 shrink-0"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-3xl">
            <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Products Found</h3>
            <p className="text-gray-500">Check back later for new digital products.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BadgeIcon({ badge }: { badge: string }) {
  let icon = <Tag className="w-3 h-3" />;
  let color = "bg-gray-800 text-gray-300 border-gray-700";

  switch (badge) {
    case 'Featured':
      icon = <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />;
      color = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      break;
    case 'Recommended':
      icon = <Zap className="w-3 h-3 fill-orange-500 text-orange-500" />;
      color = "bg-orange-500/10 text-orange-500 border-orange-500/20";
      break;
    case 'Best Seller':
      icon = <TrendingUp className="w-3 h-3 text-green-500" />;
      color = "bg-green-500/10 text-green-500 border-green-500/20";
      break;
    case 'Trending':
      icon = <Flame className="w-3 h-3 text-red-500" />;
      color = "bg-red-500/10 text-red-500 border-red-500/20";
      break;
    case 'New Arrival':
      icon = <Package className="w-3 h-3 text-blue-500" />;
      color = "bg-blue-500/10 text-blue-500 border-blue-500/20";
      break;
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 border ${color}`}>
      {icon} {badge}
    </span>
  );
}

function ProductLogo({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.storage.from('product-logos').createSignedUrl(path, 3600).then(({ data }) => {
      if (data) setUrl(data.signedUrl);
    });
  }, [path]);

  if (!url) return <div className="w-full h-full bg-gray-800 animate-pulse" />;
  return <img src={url} alt="Logo" className="w-full h-full object-cover" />;
}


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

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Shield, ArrowRight, Star, Crown, Zap } from 'lucide-react';
import { useScrollTop } from '../hooks';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function EliteGrowth() {
  useScrollTop();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('elite_growth_products')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });
          
        if (data) {
          const sortedData = [...data].sort((a, b) => {
            if (a.name === 'SAN GROW VIP METHODS') return -1;
            if (b.name === 'SAN GROW VIP METHODS') return 1;
            return 0;
          });
          setProducts(sortedData);
        }
      } catch (e) {
        console.error('Error fetching Elite Growth products', e);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => 
    (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (product.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-24 pb-20 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 mb-6"
          >
            <Star className="w-8 h-8 text-orange-500" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4"
          >
            Elite <span className="text-orange-500">Growth</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            All secret YouTube growth tricks, premium resources, exclusive strategies, updated guides, and digital products to help creators grow their channels faster.
          </motion.p>
        </div>

        {/* Search */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-lg"
              placeholder="Search guides, strategies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <span className="inline-block w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-gray-500 mt-4 text-sm">Loading resources...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="flex flex-col gap-8">
            {filteredProducts.map((product, idx) => {
              const isVip = product.name === 'SAN GROW VIP METHODS';

              if (isVip) {
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative bg-gradient-to-b from-yellow-500/10 to-gray-900 border border-yellow-500/30 rounded-3xl overflow-hidden hover:shadow-[0_0_40px_rgba(234,179,8,0.2)] transition-all flex flex-col md:flex-row group"
                  >
                    {/* Best Seller Ribbon */}
                    <div className="absolute top-6 -left-8 -rotate-45 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black text-xs px-10 py-1 shadow-lg z-20">
                      BEST SELLER
                    </div>

                    <div className="w-full md:w-2/5 relative h-64 md:h-auto overflow-hidden bg-black">
                      <img 
                        src={product.image_url || 'https://images.unsplash.com/photo-1614064641913-6b71f3016345?w=800&q=80'} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent md:bg-gradient-to-r md:from-transparent md:to-gray-900" />
                      
                      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                        <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)] flex items-center gap-1">
                          <Crown className="w-3 h-3" /> VIP
                        </span>
                        <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                          <Zap className="w-3 h-3" /> 90% OFF
                        </span>
                      </div>
                    </div>

                    <div className="p-8 md:p-10 w-full md:w-3/5 flex flex-col justify-center relative">
                      <div className="absolute top-0 left-0 w-full h-full bg-yellow-500/5 backdrop-blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      <div className="inline-block border border-yellow-500/50 text-yellow-500 text-xs font-bold px-3 py-1 rounded-full w-fit mb-4 uppercase tracking-wider">
                        Limited Time Offer
                      </div>

                      <h3 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                        {product.name}
                      </h3>
                      <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed max-w-xl">
                        {product.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-6 mt-auto">
                        <div className="flex flex-col items-center sm:items-start w-full sm:w-auto bg-black/50 p-4 rounded-2xl border border-yellow-500/20">
                          <span className="text-gray-500 line-through text-lg font-medium mb-1">₹7,000</span>
                          <span className="text-red-500 font-bold text-sm mb-1">🔴 90% OFF</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-gray-300">Only</span>
                            <span className="text-yellow-500 font-black text-4xl">₹{product.price}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 w-full sm:w-auto sm:ml-auto">
                          <button
                            onClick={() => navigate('/elite-growth/checkout', { state: { product } })}
                            className="flex-1 sm:flex-none py-4 px-8 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transform hover:-translate-y-1"
                          >
                            Buy Now <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all flex flex-col"
                >
                  <div className="h-48 relative overflow-hidden bg-gray-800">
                    <img 
                      src={product.image_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80'} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                    <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      ₹{product.price}
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-6 flex-grow">{product.description}</p>
                    
                    <button
                      onClick={() => navigate('/elite-growth/checkout', { state: { product } })}
                      className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      Buy Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-gray-800 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No resources found</h3>
            <p className="text-gray-500">Try adjusting your search.</p>
          </div>
        )}

      </div>
    </div>
  );
}

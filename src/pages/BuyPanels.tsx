import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Shield, GitFork, ChevronDown, Check, Smartphone, Laptop, Cpu, Globe, Key } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useScrollTop } from '../hooks';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { NEW_PRODUCTS } from '../data/products';

export function BuyPanels() {
  useScrollTop();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = ['All', 'Root', 'Non-root', 'ISO', 'PC'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`*, plans (*)`);
          
        let merged = [...NEW_PRODUCTS];
        
        if (data && data.length > 0) {
          data.forEach(dbProduct => {
            const index = merged.findIndex(p => p.id === dbProduct.id);
            const dbPlans = dbProduct.plans || [];
            
            if (index !== -1) {
              const localProduct = merged[index];
              merged[index] = {
                ...localProduct,
                ...dbProduct,
                plans: dbPlans.length > 0 ? dbPlans : localProduct.plans
              };
            } else {
              merged.push({
                ...dbProduct,
                plans: dbPlans
              });
            }
          });
        }
        setProducts(merged);
      } catch (e) {
        setProducts(NEW_PRODUCTS);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesFilter = false;
      if (activeFilter === 'All') {
        matchesFilter = true;
      } else {
        const cat = (product.category || '').toLowerCase();
        if (activeFilter === 'Non-root') {
          matchesFilter = cat === 'nonroot' || cat === 'non-root';
        } else if (activeFilter === 'ISO') {
          matchesFilter = cat === 'ios' || cat === 'iso';
        } else {
          matchesFilter = cat === activeFilter.toLowerCase();
        }
      }

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter, products]);

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
            <Shield className="w-8 h-8 text-orange-500" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4"
          >
            Premium <span className="text-orange-500">Panels</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Select the perfect mod for your device. All panels include anti-ban protection and auto-updates.
          </motion.p>
        </div>

        {/* Search & Filters */}
        <div className="mb-12 space-y-6">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-lg"
              placeholder="Search panels, features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Branch Selector Dropdown */}
          <div className="relative max-w-md mx-auto text-center z-30">
            <button
              onClick={() => setIsBranchOpen(!isBranchOpen)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-900 border border-gray-800 hover:border-orange-500/50 rounded-xl text-white font-bold transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <GitFork className="w-5 h-5 text-orange-500" />
                <span className="text-sm tracking-wide">BRANCH: <span className="text-orange-500 uppercase">{activeFilter}</span></span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isBranchOpen ? 'rotate-180 text-orange-500' : ''}`} />
            </button>

            <AnimatePresence>
              {isBranchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-2 bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-40 divide-y divide-gray-900"
                >
                  {filters.map(filter => (
                    <button
                      key={filter}
                      onClick={() => {
                        setActiveFilter(filter);
                        setIsBranchOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-5 py-4 text-sm font-semibold transition-all ${
                        activeFilter === filter
                          ? 'bg-orange-500/10 text-orange-500'
                          : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {filter === 'All' && <Globe className="w-4 h-4 shrink-0" />}
                        {filter === 'Root' && <Cpu className="w-4 h-4 shrink-0" />}
                        {filter === 'Non-root' && <Smartphone className="w-4 h-4 shrink-0" />}
                        {filter === 'ISO' && <Key className="w-4 h-4 shrink-0" />}
                        {filter === 'PC' && <Laptop className="w-4 h-4 shrink-0" />}
                        <span>{filter}</span>
                      </div>
                      {activeFilter === filter && <Check className="w-4 h-4 text-orange-500" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <span className="inline-block w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-gray-500 mt-4 text-sm">Loading gaming panels...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-gray-800 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or selected branch.</p>
            <button 
              onClick={() => {setSearchQuery(''); setActiveFilter('All');}}
              className="mt-6 text-orange-500 hover:text-orange-400 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

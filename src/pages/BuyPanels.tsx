import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Shield } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useScrollTop } from '../hooks';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { NEW_PRODUCTS } from '../data/products';

export function BuyPanels() {
  useScrollTop();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = ['All', 'Root', 'NonRoot', 'iOS', 'PC'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`*, plans (*)`);
          
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(NEW_PRODUCTS); // Fallback to hardcoded list
        }
      } catch (e) {
        setProducts(NEW_PRODUCTS);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = activeFilter === 'All' || product.category === activeFilter;

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

          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-2 text-gray-500 mr-2">
              <Filter className="w-4 h-4" /> <span className="text-sm font-medium">Filter:</span>
            </div>
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                    : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-gray-800 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
            <button 
              onClick={() => {setSearchQuery(''); setActiveFilter('All');}}
              className="mt-6 text-orange-500 hover:text-orange-400 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

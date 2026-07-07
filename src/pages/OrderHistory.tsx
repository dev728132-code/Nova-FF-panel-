import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { Order } from '../types';
import { useScrollTop } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function OrderHistory() {
  useScrollTop();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let mounted = true;

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('purchase_date', { ascending: false });
        
        if (error) throw error;
        
        if (mounted && data) {
          setOrders(data);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    // 1. Polling fallback (every 4 seconds) to guarantee instant status changes without manual refresh
    const pollInterval = setInterval(fetchOrders, 4000);

    // 2. Real-time Supabase subscription for truly instant updates
    const channel = supabase
      .channel(`orders_user_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime change detected:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [user?.id, authLoading]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'All') return matchesSearch;
    return matchesSearch && order.order_status === activeFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Failed': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
            Order <span className="text-orange-500">History</span>
          </h1>
          <p className="text-gray-400">Track and manage your purchased panels.</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Search by Order ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <div className="flex items-center gap-2 text-gray-500 mr-2 shrink-0">
              <Filter className="w-4 h-4" /> <span className="text-sm font-medium">Filter:</span>
            </div>
            {['All', 'Completed', 'Pending', 'Failed'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${
                  activeFilter === filter
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order, idx) => {
              const isExpired = new Date(order.expiry_date).getTime() < Date.now();

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-grow">
                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-white">{order.product_name}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.order_status)}`}>
                          {getStatusIcon(order.order_status)} {order.order_status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400">
                        <span>ID: {order.id.split('-')[0]}</span>
                        <span className="hidden md:inline">•</span>
                        <span>Plan: <span className="text-gray-300">{order.plan_duration}</span></span>
                        <span className="hidden md:inline">•</span>
                        <span>Amount: <span className="text-gray-300 font-medium">₹{order.amount}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2 shrink-0 md:min-w-[150px] pt-4 md:pt-0 border-t border-gray-800 md:border-t-0">
                    <div className="text-sm">
                      <span className="text-gray-500">Purchased: </span>
                      <span className="text-gray-300">{new Date(order.purchase_date).toLocaleDateString()}</span>
                    </div>
                    {order.order_status === 'Completed' && (
                       <div className="text-sm">
                        <span className="text-gray-500">Status: </span>
                        <span className={`font-medium ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
                          {isExpired ? 'Expired' : 'Active'}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-3xl">
            <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No orders found</h3>
            <p className="text-gray-500">You haven't made any purchases yet or no orders match your search.</p>
          </div>
        )}

      </div>
    </div>
  );
}

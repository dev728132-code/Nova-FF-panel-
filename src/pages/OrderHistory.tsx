import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { Order } from '../types';
import { useScrollTop } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function OrderHistory({ isTab = false }: { isTab?: boolean }) {
  if (!isTab) useScrollTop();
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

        const { data: eliteData, error: eliteError } = await supabase
          .from('elite_growth_orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (mounted) {
          let merged: any[] = [];
          if (data) {
            merged = [...merged, ...data.filter((o: any) => o.product_id !== 'wallet_fund_request')];
          }
          if (eliteData) {
            const eliteFormatted = eliteData.map((eo: any) => ({
              ...eo,
              purchase_date: eo.created_at,
              expiry_date: new Date(Date.now() + 36500 * 24 * 60 * 60 * 1000).toISOString(), // Lifetime
              plan_duration: 'Lifetime'
            }));
            merged = [...merged, ...eliteFormatted];
          }
          merged.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
          setOrders(merged);
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
    const channel1 = supabase
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
          fetchOrders();
        }
      )
      .subscribe();

    const channel2 = supabase
      .channel(`elite_orders_user_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'elite_growth_orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      clearInterval(pollInterval);
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, [user?.id, authLoading]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Completed') {
      return matchesSearch && (order.order_status === 'Completed' || order.order_status === 'Approved' || order.order_status === 'Success');
    }
    return matchesSearch && order.order_status === activeFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Success':
      case 'Approved':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Pending':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Failed':
      case 'Rejected':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Success':
      case 'Approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Failed':
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className={isTab ? "pb-10" : "pt-24 pb-20 min-h-screen bg-black"}>
      <div className={isTab ? "" : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"}>
        
        {!isTab && <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
            Order <span className="text-orange-500">History</span>
          </h1>
          <p className="text-gray-400">Track and manage your purchased panels.</p>
        </div>}

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
                {filter === 'Completed' ? 'Approved' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order, idx) => {
              const isExpired = new Date(order.expiry_date).getTime() < Date.now();
              const isApprovedOrCompleted = order.order_status === 'Approved' || order.order_status === 'Completed' || order.order_status === 'Success';

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6 flex flex-col gap-5 hover:border-gray-700 transition-colors"
                >
                  <div className="flex flex-col md:flex-row gap-6 justify-between md:items-center">
                    <div className="flex items-start gap-4 flex-grow">
                      <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-white">{order.product_name}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.order_status)}`}>
                            {getStatusIcon(order.order_status)} {isApprovedOrCompleted ? 'Success' : order.order_status}
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
                      {isApprovedOrCompleted && (
                        <div className="text-sm">
                          <span className="text-gray-500">Status: </span>
                          <span className={`font-medium ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
                            {isExpired ? 'Expired' : 'Active'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivered Product Key / Message or Rejection Message */}
                  {isApprovedOrCompleted && order.product_key ? (
                    <div className="mt-2 pt-4 border-t border-gray-800/60 bg-black/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-grow min-w-0">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold block mb-1">Your Product Key / License / Message:</span>
                        <pre className="text-xs text-green-400 font-mono bg-black/60 p-3 rounded-lg border border-gray-800/80 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                          {order.product_key}
                        </pre>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(order.product_key);
                          const toast = document.createElement('div');
                          toast.className = 'fixed bottom-5 right-5 bg-green-500 text-white font-bold px-5 py-3 rounded-xl shadow-2xl z-50 animate-fade-in text-sm border border-green-400/30';
                          toast.innerText = 'Product Key copied!';
                          document.body.appendChild(toast);
                          setTimeout(() => toast.remove(), 2000);
                        }}
                        className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-xs transition-all self-end sm:self-center shrink-0 flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                      >
                        Copy Key
                      </button>
                    </div>
                  ) : (!isApprovedOrCompleted && order.product_key && (order.order_status === 'Failed' || order.order_status === 'Rejected') ? (
                    <div className="mt-2 pt-4 border-t border-gray-800/60 bg-red-950/20 rounded-xl p-4 flex flex-col gap-2">
                      <span className="text-xs text-red-400 uppercase tracking-wider font-bold block">Reason for Rejection / Admin Message:</span>
                      <pre className="text-xs text-red-300 font-mono bg-red-950/40 p-3 rounded-lg border border-red-900/30 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                        {order.product_key}
                      </pre>
                    </div>
                  ) : null)}
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

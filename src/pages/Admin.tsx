import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../types';
import { useScrollTop } from '../hooks';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Admin() {
  useScrollTop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOwnerAlert, setShowOwnerAlert] = useState(true);

  const [filter, setFilter] = useState<'All' | 'Pending' | 'Verified' | 'Rejected'>('Pending');

  const isOwner = user?.email === 'dev7287132@gmail.com' || user?.email === 'dev728132@gmail.com';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!isOwner) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    let mounted = true;
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error(error);
      } else if (mounted) {
        setOrders(data as Order[]);
      }
      if (mounted) {
        setLoading(false);
      }
    };

    fetchOrders();

    // 1. Poll database every 4 seconds so updates are captured immediately
    const pollInterval = setInterval(fetchOrders, 4000);

    // 2. Real-time subscription to catch insertions and updates instantly
    const channel = supabase
      .channel('admin_orders_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [user?.id, navigate]);

  const updateOrderStatus = async (orderId: string, status: 'Verified' | 'Rejected') => {
    try {
      const orderStatus = status === 'Verified' ? 'Completed' : 'Failed';
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: status,
          order_status: orderStatus
        })
        .eq('id', orderId);

      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, payment_status: status, order_status: orderStatus } 
          : order
      ));
      
    } catch (e: any) {
      alert("Error updating order: " + e.message);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'All') return true;
    return order.payment_status === filter;
  });

  const pendingCount = orders.filter(o => o.payment_status === 'Pending').length;

  if (user && !isOwner) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center bg-black text-center px-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
        <h1 className="text-3xl font-black text-white mb-2 tracking-wide">ACCESS DENIED</h1>
        <p className="text-gray-400">You do not have administrative privileges to access this panel.</p>
        <p className="text-gray-500 text-sm mt-2">Redirecting to Home...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isOwner && showOwnerAlert && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-between text-green-400 text-sm font-semibold shadow-[0_0_15px_rgba(34,197,94,0.15)] animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Owner login detected. Assigned Admin role.</span>
            </div>
            <button onClick={() => setShowOwnerAlert(false)} className="text-green-500 hover:text-green-400 text-xs font-bold font-mono">
              [DISMISS]
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          {pendingCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {pendingCount} New Request{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-6">
          {['Pending', 'Verified', 'Rejected', 'All'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors relative ${
                filter === f 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {f === 'Verified' ? 'Approved' : f}
              {f === 'Pending' && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-black/50">
                  <th className="p-4 text-sm font-semibold text-gray-400">Order ID</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Customer</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Product</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Amount</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">UTR / Details</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Date/Time</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
                  <th className="p-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-black/20 transition-colors">
                      <td className="p-4">
                        <span className="text-sm font-mono text-gray-400" title={order.id}>
                          ...{order.id.slice(-6)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-white">{order.customer_name || 'Anonymous'}</div>
                        <div className="text-xs text-gray-400">{order.customer_email || '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-white">{order.product_name || order.product_id}</div>
                        <div className="text-xs text-orange-500">{order.plan_duration}</div>
                      </td>
                      <td className="p-4 font-bold text-white">
                        ₹{order.amount}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-300">
                          {order.utr_number ? <span className="font-mono">{order.utr_number}</span> : <span className="text-gray-600">No UTR</span>}
                        </div>
                        {order.payment_screenshot_url && (
                          <a href={order.payment_screenshot_url} target="_blank" rel="noreferrer" className="text-xs text-orange-500 hover:underline">
                            View Screenshot
                          </a>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        <div>{order.payment_date || (order.purchase_date && new Date(order.purchase_date).toLocaleDateString()) || '-'}</div>
                        <div>{order.payment_time || (order.purchase_date && new Date(order.purchase_date).toLocaleTimeString()) || '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          order.payment_status === 'Verified' || order.order_status === 'Completed'
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : order.payment_status === 'Rejected' || order.order_status === 'Failed'
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                          {order.payment_status === 'Verified' || order.order_status === 'Completed' ? <CheckCircle className="w-3 h-3" /> :
                           order.payment_status === 'Rejected' || order.order_status === 'Failed' ? <XCircle className="w-3 h-3" /> :
                           <Clock className="w-3 h-3" />}
                          {order.payment_status === 'Pending' ? order.order_status : order.payment_status}
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {order.payment_status === 'Pending' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Verified')}
                              className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-500 rounded-lg text-sm font-medium transition-colors border border-green-500/20"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Rejected')}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

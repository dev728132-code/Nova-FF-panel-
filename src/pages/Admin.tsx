import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../types';
import { useScrollTop } from '../hooks';
import { AdminEliteProducts } from '../components/AdminEliteProducts';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminPromoCodes } from '../components/admin/AdminPromoCodes';
import { AdminLoginHistory } from '../components/admin/AdminLoginHistory';
import { AdminNotifications } from '../components/admin/AdminNotifications';
import { AdminSentMessages } from '../components/admin/AdminSentMessages';
import { AdminDigitalProducts } from '../components/admin/AdminDigitalProducts';
import { Shield, CheckCircle, XCircle, Clock, Wallet, Star, Users, Tag, Activity, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Admin() {
  useScrollTop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fundRequests, setFundRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOwnerAlert, setShowOwnerAlert] = useState(true);

  const [adminTab, setAdminTab] = useState<'purchases' | 'funds' | 'elite_products' | 'users' | 'promo' | 'logins' | 'notifications' | 'sent_messages' | 'digital_products'>('purchases');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Verified' | 'Rejected'>('Pending');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [productKey, setProductKey] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const isOwner = user?.email === 'dev7287132@gmail.com' || user?.email === 'dev728132@gmail.com' || user?.email === 'tkjdjdsjjs@gmail.com';

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
      // 1. Fetch product orders
      const { data: oData, error: oError } = await supabase
        .from('orders')
        .select('*')
        .order('purchase_date', { ascending: false });

      // Fetch elite growth orders
      const { data: egData, error: egError } = await supabase
        .from('elite_growth_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (oError) {
        console.error('Error fetching orders:', oError);
      }
      if (egError) {
        console.error('Error fetching elite growth orders:', egError);
      }

      if (mounted) {
        let mergedOrders: any[] = [];
        if (oData) {
          mergedOrders = [...mergedOrders, ...oData];
        }
        if (egData) {
          const egFormatted = egData.map((eo: any) => ({
            ...eo,
            purchase_date: eo.created_at,
            plan_duration: 'Lifetime',
            is_elite_growth_table: true,
            payment_screenshot_url: eo.screenshot_url || eo.payment_screenshot_url
          }));
          mergedOrders = [...mergedOrders, ...egFormatted];
        }
        mergedOrders.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
        setOrders(mergedOrders as Order[]);
      }

      // 2. Fetch fund requests from separate table
      const { data: frData, error: frError } = await supabase
        .from('fund_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (frError) {
        console.warn('fund_requests table might not exist yet:', frError);
        if (mounted) setFundRequests([]);
      } else if (mounted) {
        setFundRequests(frData || []);
      }

      // Fetch unread notifications count
      const { count: notifCount, error: notifError } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      
      if (!notifError && mounted && notifCount !== null) {
        setUnreadNotifications(notifCount);
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

    // Subscribe to fund_requests as well
    const frChannel = supabase
      .channel('admin_fund_requests_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fund_requests'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    // Subscribe to elite_growth_orders
    const egChannel = supabase
      .channel('admin_elite_growth_orders_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'elite_growth_orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    // Subscribe to notifications
    const notifChannel = supabase
      .channel('admin_notifications_count_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_notifications'
        },
        () => {
          fetchOrders(); // also re-fetches notif count
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
      supabase.removeChannel(frChannel);
      supabase.removeChannel(egChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [user?.id, navigate]);

  const handleOpenApproveModal = (order: any) => {
    setSelectedOrder(order);
    setModalType('approve');
    setProductKey('');
    setErrorMessage(null);
  };

  const handleOpenRejectModal = (order: any) => {
    setSelectedOrder(order);
    setModalType('reject');
    setProductKey('');
    setErrorMessage(null);
  };

  const handleProcessRequest = async () => {
    if (!selectedOrder || !modalType || isApproving) return;
    setIsApproving(true);
    setErrorMessage(null);

    const isApprove = modalType === 'approve';
    let noteOrKey = productKey.trim();

    if (isApprove && !selectedOrder.is_fund_request_table) {
      try {
        const res = await fetch("/api/reseller/buy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: selectedOrder.id,
            isElite: !!selectedOrder.is_elite_growth_table,
            product_id: selectedOrder.product_id,
            duration: selectedOrder.plan_duration || "Elite Growth",
            user_id: selectedOrder.user_id,
            payment_id: selectedOrder.utr_number || "admin_verify"
          })
        });
        const data = await res.json();
        if (data.success && data.deliveryData) {
           noteOrKey = data.deliveryData;
        } else {
           alert("Reseller API Warning: " + (data.error || "Failed to fetch key. Check logs."));
        }
      } catch(e) {
        console.error("Reseller API Error", e);
      }
    }
    try {
      if (selectedOrder.is_fund_request_table) {
        // Update fund_requests table
        const statusVal = isApprove ? 'Verified' : 'Rejected';
        const defaultNote = isApprove 
          ? `Approved by admin on ${new Date().toLocaleDateString()}`
          : `Rejected by admin on ${new Date().toLocaleDateString()}`;

        const { error } = await supabase
          .from('fund_requests')
          .update({
            status: statusVal,
            admin_note: noteOrKey || defaultNote
          })
          .eq('id', selectedOrder.id);

        if (error) throw error;

        setFundRequests(prev => prev.map(fr =>
          fr.id === selectedOrder.id ? { ...fr, status: statusVal, admin_note: noteOrKey || defaultNote } : fr
        ));
        } else if (selectedOrder.is_elite_growth_table) {
        // Update elite_growth_orders table
        const pStatus = isApprove ? 'Verified' : 'Rejected';
        const oStatus = isApprove ? 'Completed' : 'Failed';

        const { error } = await supabase
          .from('elite_growth_orders')
          .update({
            payment_status: pStatus,
            order_status: oStatus,
            product_key: noteOrKey || (isApprove ? 'Approved' : 'Rejected')
          })
          .eq('id', selectedOrder.id);

        if (error) throw error;
        
        setOrders(prev => prev.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, payment_status: pStatus, order_status: oStatus, product_key: noteOrKey || (isApprove ? 'Approved' : 'Rejected') } 
            : order
        ));
      } else {
        // Update orders table
        const pStatus = isApprove ? 'Success' : 'Rejected';
        const oStatus = isApprove ? 'Approved' : 'Failed';

        const { error } = await supabase
          .from('orders')
          .update({
            payment_status: pStatus,
            order_status: oStatus,
            product_key: noteOrKey || (isApprove ? 'Approved' : 'Rejected')
          })
          .eq('id', selectedOrder.id);

        if (error) throw error;
        
        setOrders(prev => prev.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, payment_status: pStatus, order_status: oStatus, product_key: noteOrKey || (isApprove ? 'Approved' : 'Rejected') } 
            : order
        ));
      }

      // Close modal
      setSelectedOrder(null);
      setModalType(null);
      setProductKey('');

      // Show temporary successful toast
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-5 right-5 bg-green-500 text-white font-bold px-5 py-3 rounded-xl shadow-2xl z-50 animate-fade-in text-sm border border-green-400/30';
      toast.innerText = isApprove ? 'Order approved and key delivered!' : 'Order rejected successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

    } catch (e: any) {
      console.error("Error processing request:", e);
      setErrorMessage(e.message || "Failed to update database. Please check connection and permissions.");
    } finally {
      setIsApproving(false);
    }
  };

  const purchasesOrders = orders.filter(o => o.product_id !== 'wallet_fund_request');
  
  // If we have separate fund requests records, map them. Otherwise fallback to filtering orders.
  const fundsOrders = fundRequests.length > 0
    ? fundRequests.map(fr => {
        const cDate = new Date(fr.created_at);
        const paymentDate = cDate.toISOString().split('T')[0];
        const paymentTime = cDate.toTimeString().split(' ')[0].substring(0, 5);
        return {
          id: fr.id,
          user_id: fr.user_id,
          product_id: 'wallet_fund_request',
          product_name: fr.panel_name && fr.plan_name ? `${fr.panel_name} - ${fr.plan_name}` : 'Wallet Fund Request',
          plan_duration: 'One-time',
          amount: fr.amount,
          payment_status: fr.status,
          order_status: fr.status === 'Verified' ? 'Completed' : fr.status === 'Rejected' ? 'Failed' : 'Pending',
          purchase_date: fr.created_at,
          payment_screenshot_url: fr.payment_screenshot || fr.payment_screenshot_url,
          utr_number: fr.utr_number,
          payment_date: paymentDate,
          payment_time: paymentTime,
          customer_name: fr.username || fr.customer_name || 'Anonymous User',
          customer_email: fr.email || fr.customer_email || 'No Email',
          is_fund_request_table: true
        };
      })
    : orders.filter(o => o.product_id === 'wallet_fund_request');

  const currentTabOrders = adminTab === 'purchases' ? purchasesOrders : fundsOrders;

  const filteredOrders = currentTabOrders.filter(order => {
    if (filter === 'All') return true;
    return order.payment_status === filter;
  });

  const pendingPurchasesCount = purchasesOrders.filter(o => o.payment_status === 'Pending').length;
  const pendingFundsCount = fundsOrders.filter(o => o.payment_status === 'Pending').length;
  const pendingCount = adminTab === 'purchases' ? pendingPurchasesCount : pendingFundsCount;
  const totalPendingCount = pendingPurchasesCount + pendingFundsCount;

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
          <button
            onClick={() => setAdminTab('sent_messages')}
            className={`pb-4 font-bold transition-all relative flex items-center gap-2 focus:outline-none whitespace-nowrap ${
              adminTab === 'sent_messages'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg> Sent Messages
          </button>
          <button
            onClick={() => setAdminTab('digital_products')}
            className={`pb-4 font-bold transition-all relative flex items-center gap-2 focus:outline-none whitespace-nowrap ${
              adminTab === 'digital_products'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg> Digital Products
          </button>
        </div>
        )}

        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          {totalPendingCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
              {totalPendingCount} New Alert{totalPendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-800 mb-8 gap-6 text-sm overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => {
              setAdminTab('purchases');
              setFilter('Pending');
            }}
            className={`pb-4 font-bold transition-all relative flex items-center gap-2 focus:outline-none whitespace-nowrap ${
              adminTab === 'purchases'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" /> Product Purchases
            {pendingPurchasesCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                {pendingPurchasesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setAdminTab('funds');
              setFilter('Pending');
            }}
            className={`pb-4 font-bold transition-all relative flex items-center gap-2 focus:outline-none whitespace-nowrap ${
              adminTab === 'funds'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" /> Fund Requests
            {pendingFundsCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                {pendingFundsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setAdminTab('elite_products');
            }}
            className={`pb-4 font-bold transition-all relative flex items-center gap-2 focus:outline-none whitespace-nowrap ${
              adminTab === 'elite_products'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4" /> Elite Products
          </button>
          
          <button
            onClick={() => {
              setAdminTab('users');
            }}
            className={`pb-4 font-bold transition-all relative flex items-center gap-2 focus:outline-none whitespace-nowrap ${
              adminTab === 'users'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Users & Resellers
          </button>
          
          <button
            onClick={() => {
              setAdminTab('promo');
            }}
            className={`pb-4 font-bold transition-all relative flex items-center gap-2 focus:outline-none whitespace-nowrap ${
              adminTab === 'promo'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" /> Promo Codes
          </button>
          
          <button
            onClick={() => {
              setAdminTab('logins');
            }}
            className={`pb-4 font-bold transition-all relative flex items-center gap-2 focus:outline-none whitespace-nowrap ${
              adminTab === 'logins'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" /> Logins
          </button>

          <button
            onClick={() => {
              setAdminTab('notifications');
            }}
            className={`pb-4 font-bold transition-all relative flex items-center gap-2 focus:outline-none whitespace-nowrap ${
              adminTab === 'notifications'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>

          <button

            onClick={() => {

              setAdminTab('sent_messages');

            }}

            className={`pb-4 font-bold transition-all relative flex items-center gap-2 focus:outline-none whitespace-nowrap ${

              adminTab === 'sent_messages'

                ? 'border-b-2 border-orange-500 text-orange-400'

                : 'text-gray-500 hover:text-white'

            }`}

          >

            
            {unreadNotifications > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                {unreadNotifications}
              </span>
            )}
          </button>
          <button
            onClick={() => setAdminTab('sent_messages')}
            className={`pb-4 font-bold transition-all relative flex items-center gap-2 focus:outline-none whitespace-nowrap ${
              adminTab === 'sent_messages'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg> Sent Messages
          </button>
          <button
            onClick={() => setAdminTab('digital_products')}
            className={`pb-4 font-bold transition-all relative flex items-center gap-2 focus:outline-none whitespace-nowrap ${
              adminTab === 'digital_products'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg> Digital Products
          </button>
        </div>

        {adminTab === 'users' ? (
          <AdminUsers />
        ) : adminTab === 'promo' ? (
          <AdminPromoCodes />
        ) : adminTab === 'logins' ? (
          <AdminLoginHistory />
                ) : adminTab === 'sent_messages' ? (
          <AdminSentMessages />
        ) : adminTab === 'notifications' ? (
        
          <AdminNotifications />
                ) : adminTab === 'elite_products' ? (
          <AdminEliteProducts />
        ) : adminTab === 'digital_products' ? (
          <AdminDigitalProducts />
        ) : (
          <>
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
                  <th className="p-4 text-sm font-semibold text-gray-400">
                    {adminTab === 'funds' ? 'Top-up Type' : 'Product'}
                  </th>
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
                      No {adminTab === 'funds' ? 'fund requests' : 'orders'} found.
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
                        <div className="font-medium text-white">
                          {adminTab === 'funds' ? 'Wallet Top-up' : (order.product_name || order.product_id)}
                        </div>
                        <div className="text-xs text-orange-500">
                          {adminTab === 'funds' ? 'Wallet Deposit' : order.plan_duration}
                        </div>
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
                          order.payment_status === 'Verified' || order.order_status === 'Completed' || order.payment_status === 'Success' || order.order_status === 'Approved'
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : order.payment_status === 'Rejected' || order.order_status === 'Failed'
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                          {order.payment_status === 'Verified' || order.order_status === 'Completed' || order.payment_status === 'Success' || order.order_status === 'Approved' ? <CheckCircle className="w-3 h-3" /> :
                           order.payment_status === 'Rejected' || order.order_status === 'Failed' ? <XCircle className="w-3 h-3" /> :
                           <Clock className="w-3 h-3" />}
                          {order.payment_status === 'Pending' ? order.order_status : (order.payment_status === 'Verified' ? 'Success' : order.payment_status)}
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {order.payment_status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleOpenApproveModal(order)}
                              className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-500 rounded-lg text-sm font-medium transition-colors border border-green-500/20"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(order)}
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
        </>
        )}
      </div>

      {/* Processing Modal (Approve or Reject) */}
      {selectedOrder && modalType && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 text-left relative overflow-hidden shadow-2xl animate-fade-in">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-3">
              {modalType === 'approve' ? (
                <>
                  <Shield className="w-5 h-5 text-green-500" /> Deliver Product Key & Approve
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" /> Provide Rejection Reason & Reject
                </>
              )}
            </h3>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
                {errorMessage}
              </div>
            )}

            <div className="space-y-4 mb-6 text-xs text-gray-300">
              <div className="grid grid-cols-2 gap-4 bg-black/40 p-3.5 rounded-xl border border-gray-800/60">
                <div>
                  <span className="text-gray-500 font-semibold block mb-0.5">Product Name:</span>
                  <span className="text-white font-bold">{selectedOrder.product_name}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block mb-0.5">User Name:</span>
                  <span className="text-white font-bold">{selectedOrder.customer_name || 'Anonymous User'}</span>
                </div>
              </div>

              <div className="bg-black/40 p-3.5 rounded-xl border border-gray-800/60">
                <span className="text-gray-500 font-semibold block mb-1">Payment Details:</span>
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 font-mono">
                  <span>Amount: <strong className="text-green-400">₹{selectedOrder.amount}</strong></span>
                  {selectedOrder.utr_number && <span>UTR: <strong className="text-orange-400">{selectedOrder.utr_number}</strong></span>}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-2">
                  {modalType === 'approve' 
                    ? "Product Key / License / Message to Customer *" 
                    : "Rejection Reason / Message to Customer *"}
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={modalType === 'approve' 
                    ? "Paste product key, license details, login instructions or any message to the customer..." 
                    : "Please provide a reason why this payment was rejected (e.g. incorrect UTR, blank screenshot, etc.). This will be shown to the customer."}
                  value={productKey}
                  onChange={(e) => setProductKey(e.target.value)}
                  className="block w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  setModalType(null);
                  setProductKey('');
                  setErrorMessage(null);
                }}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isApproving}
                onClick={handleProcessRequest}
                className={`px-5 py-2.5 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                  modalType === 'approve' 
                    ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 shadow-[0_0_15px_rgba(249,115,22,0.25)]" 
                    : "bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.25)]"
                }`}
              >
                {isApproving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : modalType === 'approve' ? (
                  'Send & Approve'
                ) : (
                  'Send & Reject'
                )}
              </button>
          <button
            onClick={() => setAdminTab('sent_messages')}
            className={`pb-4 font-bold transition-all relative flex items-center gap-2 focus:outline-none whitespace-nowrap ${
              adminTab === 'sent_messages'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg> Sent Messages
          </button>
          <button
            onClick={() => setAdminTab('digital_products')}
            className={`pb-4 font-bold transition-all relative flex items-center gap-2 focus:outline-none whitespace-nowrap ${
              adminTab === 'digital_products'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg> Digital Products
          </button>
        </div>
          </div>
        </div>
      )}
    </div>
  );
}

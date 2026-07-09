import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Upload, ShieldCheck, ArrowLeft, QrCode, AlertCircle, Wallet, Crown, Zap, RefreshCw, Star } from 'lucide-react';
import { useScrollTop } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function EliteGrowthCheckout() {
  useScrollTop();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTime, setPaymentTime] = useState(new Date().toTimeString().substring(0, 5));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'wallet'>('upi');
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);

  const state = location.state as { product: any } | null;

  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchWalletBalance = async () => {
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id);

        if (ordersError) throw ordersError;

        const { data: fundRequests, error: fundRequestsError } = await supabase
          .from('fund_requests')
          .select('*')
          .eq('user_id', user.id);

        if (fundRequestsError) {
          if (ordersData) {
            const approvedDeposits = ordersData
              .filter((o: any) => o.product_id === 'wallet_fund_request' && o.payment_status === 'Verified')
              .reduce((sum: number, o: any) => sum + Number(o.amount), 0);

            const walletPurchases = ordersData
              .filter((o: any) => o.utr_number === 'wallet_payment')
              .reduce((sum: number, o: any) => sum + Number(o.amount), 0);

            setWalletBalance(approvedDeposits - walletPurchases);
          }
        } else {
          const approvedDeposits = (fundRequests || [])
            .filter((fr: any) => fr.status === 'Verified')
            .reduce((sum: number, fr: any) => sum + Number(fr.amount), 0);

          const walletPurchases = (ordersData || [])
            .filter((o: any) => o.utr_number === 'wallet_payment')
            .reduce((sum: number, o: any) => sum + Number(o.amount), 0);

          setWalletBalance(approvedDeposits - walletPurchases);
        }
      } catch (err) {
        console.error('Error fetching wallet balance:', err);
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWalletBalance();
    
    const interval = setInterval(fetchWalletBalance, 5000);
    return () => clearInterval(interval);
  }, [user]);
  
  useEffect(() => {
    if (user && state?.product) {
      let mounted = true;
      const checkPending = async () => {
        try {
          const { data } = await supabase
            .from('elite_growth_orders')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', state.product.id)
            .eq('payment_status', 'Pending')
            .limit(1);
            
          if (mounted) {
            setHasPendingRequest(data && data.length > 0 ? true : false);
          }
        } catch (err) {
          console.error('Error checking pending order:', err);
        }
      };
      
      checkPending();

      const interval = setInterval(checkPending, 4000);

      const channel = supabase
        .channel(`elite_growth_orders_checkout_${user.id}_${state.product.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'elite_growth_orders',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            checkPending();
          }
        )
        .subscribe();

      return () => {
        mounted = false;
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    }
  }, [user, state]);

  if (authLoading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="w-16 h-16 text-orange-500 mb-6" />
        <h2 className="text-3xl font-black text-white mb-4">No Product Selected</h2>
        <p className="text-gray-400 mb-8 max-w-md">Please select a product from the Elite Growth store before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/elite-growth')}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors"
        >
          Go to Store
        </button>
      </div>
    );
  }

  const { product } = state;
  const upiId = "7563075001@ybl";
  const merchantName = "FF Store";
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${product.price}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  const handleConfirm = async () => {
    if (!user) {
      alert("Please login first to make a purchase.");
      navigate('/auth');
      return;
    }

    const isWalletPayment = paymentMethod === 'wallet';

    if (isWalletPayment) {
      if (walletBalance < product.price) {
        alert("Insufficient Wallet Balance. Please add funds.");
        return;
      }
    } else {
      if (!utrNumber || !paymentDate || !paymentTime) {
        alert("Please fill in UTR/Transaction ID, Date, and Time.");
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      let screenshotUrl = null;
      if (!isWalletPayment && file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment_screenshots')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('payment_screenshots')
          .getPublicUrl(filePath);
          
        screenshotUrl = publicUrlData.publicUrl;
      }

      // Fetch user profile name
      let customerName = user.user_metadata?.full_name || 'Anonymous User';
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (profile?.full_name) {
          customerName = profile.full_name;
        }
      } catch (profileErr) {
        console.warn('Could not fetch profile for order:', profileErr);
      }

      const pDate = isWalletPayment ? new Date().toISOString().split('T')[0] : paymentDate;
      const pTime = isWalletPayment ? new Date().toTimeString().split(' ')[0].substring(0, 5) : paymentTime;

      // Also create a regular order entry for wallet deduction if it's a wallet payment
      if (isWalletPayment) {
        const { error: orderError } = await supabase.from('orders').insert({
          user_id: user.id,
          product_id: 'elite_growth_purchase',
          product_name: `Elite Growth - ${product.name}`,
          plan_duration: 'Lifetime',
          amount: product.price,
          payment_status: 'Verified',
          order_status: 'Completed',
          expiry_date: new Date(Date.now() + 36500 * 24 * 60 * 60 * 1000).toISOString(),
          utr_number: 'wallet_payment',
          payment_date: pDate,
          payment_time: pTime,
          customer_name: customerName,
          customer_email: user.email
        });
        if (orderError) throw orderError;
      }

      const { error: insertError } = await supabase.from('elite_growth_orders').insert({
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        amount: product.price,
        payment_status: isWalletPayment ? 'Verified' : 'Pending',
        order_status: isWalletPayment ? 'Completed' : 'Pending',
        screenshot_url: screenshotUrl,
        utr_number: isWalletPayment ? 'wallet_payment' : utrNumber,
      });

      if (insertError) throw insertError;
      
      try {
        await supabase.from('admin_notifications').insert({
          type: 'New VIP Order',
          message: `New manual payment order submitted for VIP Product: ${product.name} by ${user.email}.`
        });
      } catch(e) {}

      if (!isWalletPayment) {
        toast.success('Payment request submitted. Admin has been notified!');
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      alert('Error processing order: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    const isWallet = paymentMethod === 'wallet';
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle className="w-12 h-12 text-green-500" />
        </motion.div>
        <h2 className="text-4xl font-black text-white mb-4 text-center">
          {isWallet ? "Purchase Complete!" : "Order Submitted!"}
        </h2>
        <p className="text-gray-400 text-center max-w-md mb-8 leading-relaxed">
          {isWallet 
            ? "Your Elite Growth resource has been approved and activated instantly using your wallet balance! You can view it in your order history."
            : "Payment request submitted successfully. Please wait while the admin verifies your payment. You will be notified once it is approved or rejected."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/history')}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors"
          >
            View Order Status
          </button>
          <button
            onClick={() => navigate('/elite-growth')}
            className="px-8 py-3 bg-gray-900 border border-gray-700 hover:bg-gray-800 text-white rounded-xl font-bold transition-colors"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  const isVip = product.name === 'SAN GROW VIP METHODS';

  return (
    <div className="pt-24 pb-20 min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {isVip && (
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-gradient-to-b from-yellow-500/10 to-gray-900 border border-yellow-500/30 rounded-3xl overflow-hidden relative shadow-[0_0_40px_rgba(234,179,8,0.1)]">
                {/* BEST SELLER Ribbon */}
                <div className="absolute top-6 -left-8 -rotate-45 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black text-xs px-10 py-1 shadow-lg z-20">
                  BEST SELLER
                </div>
                
                <div className="relative h-64 md:h-80 overflow-hidden bg-black">
                  <img src={product.image_url || 'https://images.unsplash.com/photo-1614064641913-6b71f3016345?w=800&q=80'} className="w-full h-full object-cover" alt={product.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                      <Crown className="w-3 h-3" /> VIP
                    </span>
                    <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                      <Zap className="w-3 h-3" /> 90% OFF
                    </span>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="inline-block border border-yellow-500/50 text-yellow-500 text-xs font-bold px-3 py-1 rounded-full w-fit mb-4 uppercase tracking-wider">
                    Lifetime Access
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">{product.name}</h3>
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">{product.description}</p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                    <div className="flex flex-col items-center sm:items-start w-full sm:w-auto bg-black/50 p-4 rounded-2xl border border-yellow-500/20">
                      <span className="text-gray-500 line-through text-lg font-medium mb-1">₹7,000</span>
                      <span className="text-red-500 font-bold text-sm mb-1">🔴 90% OFF</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-gray-300">Only</span>
                        <span className="text-yellow-500 font-black text-4xl">₹{product.price}</span>
                      </div>
                    </div>
                  </div>

                  {product.features && product.features.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      {product.features.map((f: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 bg-black/50 p-4 rounded-2xl border border-gray-800 hover:border-yellow-500/30 transition-colors">
                          <CheckCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                          <span className="text-gray-300 font-medium text-sm">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-2xl p-6 flex gap-4 items-center">
                    <RefreshCw className="w-8 h-8 text-yellow-500 shrink-0" />
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">Regular Updates Included</h4>
                      <p className="text-gray-400 text-sm">Get lifetime access to all future methods and resources automatically. No extra fees.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={isVip ? "lg:col-span-2 space-y-6" : "lg:col-span-3 space-y-6"}>
            <div className={`rounded-2xl p-6 md:p-8 ${isVip ? 'bg-gray-900 border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]' : 'bg-gray-900 border border-gray-800'}`}>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isVip ? 'text-yellow-500' : 'text-white'}`}>
                <QrCode className="w-6 h-6" /> Payment Details
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold border transition-all text-xs ${
                    paymentMethod === 'upi'
                      ? 'bg-orange-500/10 border-orange-500 text-orange-400 font-bold'
                      : 'bg-black border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4" /> UPI QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold border transition-all text-xs ${
                    paymentMethod === 'wallet'
                      ? 'bg-orange-500/10 border-orange-500 text-orange-400 font-bold'
                      : 'bg-black border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                  }`}
                >
                  <Wallet className="w-4 h-4" /> Pay with Wallet
                </button>
              </div>

              {paymentMethod === 'upi' ? (
                <>
                  <div className="bg-black border border-orange-500/30 rounded-xl p-6 mb-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5" />
                    <div className="mb-4 relative z-10 space-y-1">
                      <p className="text-sm text-gray-400">Product: <span className="text-white font-bold">{product.name}</span></p>
                      <p className="text-sm text-gray-400">Amount: <span className="text-orange-500 font-bold">₹{product.price}</span></p>
                    </div>
                    <div className="w-full border-t border-gray-800/50 my-3 relative z-10" />
                    <p className="text-sm text-gray-400 mb-2 relative z-10">Scan QR or Copy UPI ID</p>
                    <div className="text-2xl md:text-3xl font-mono font-bold text-white mb-4 relative z-10">
                      {upiId}
                    </div>
                    <div className="bg-white p-4 rounded-xl inline-block mb-4 relative z-10">
                      <img 
                        src={qrCodeUrl} 
                        alt="UPI QR Code" 
                        className="w-48 h-48 animate-fade-in"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-xs text-gray-500 relative z-10">Please pay exactly ₹{product.price}</p>
                  </div>

                  <div className="space-y-4 mb-8 text-left">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">UTR / Transaction ID *</label>
                      <input
                        type="text"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="Enter 12-digit UTR or Transaction ID"
                        className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                      <p className="text-xs text-orange-500/80 mt-1.5 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> This field is safe. All transaction details are encrypted and verified under our strict privacy policy.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Payment Date *</label>
                        <input
                          type="date"
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Payment Time *</label>
                        <input
                          type="time"
                          value={paymentTime}
                          onChange={(e) => setPaymentTime(e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-4">Upload Screenshot (Optional)</h3>
                  <p className="text-sm text-gray-400 mb-4">After making the payment, optionally upload the screenshot for faster verification.</p>
                  
                  <label className={`
                    flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all
                    ${file ? 'border-green-500 bg-green-500/5' : 'border-gray-700 hover:border-orange-500 hover:bg-gray-800/50'}
                  `}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {file ? (
                        <>
                          <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
                          <p className="text-sm text-white font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500 mt-1">Click to change file</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-500 mb-3" />
                          <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-white">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <p className="text-xs text-orange-500/80 mt-2 flex items-center gap-1 justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" /> This field is safe. Uploaded images are private and verified securely under our good policies.
                  </p>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Wallet info */}
                  <div className="bg-black border border-gray-800 rounded-xl p-6 relative overflow-hidden">
                    <div className="flex flex-col gap-4 text-sm">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-800/60">
                        <span className="text-gray-400">Your Current Balance</span>
                        <span className="text-white font-black font-mono">₹{walletBalance}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-800/60">
                        <span className="text-gray-400">Product Price</span>
                        <span className="text-orange-500 font-black font-mono">- ₹{product.price}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-gray-300 font-bold">Remaining Balance</span>
                        <span className={`font-black font-mono text-lg ${
                          walletBalance >= product.price ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ₹{walletBalance - product.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {walletBalance < product.price ? (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 flex gap-3 text-xs">
                      <AlertCircle className="w-5 h-5 shrink-0 animate-pulse" />
                      <div>
                        <span className="font-bold block mb-1">Insufficient Wallet Balance</span>
                        You need <span className="font-bold text-white font-mono">₹{product.price - walletBalance}</span> more to purchase this plan. Please visit your profile dashboard to top-up.
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-4 flex gap-3 text-xs">
                      <CheckCircle className="w-5 h-5 shrink-0" />
                      <div>
                        <span className="font-bold block mb-1">Funds Available</span>
                        Your transaction will be processed instantly! No manual verification is needed for wallet payments.
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleConfirm}
                disabled={
                  isSubmitting || 
                  (paymentMethod === 'upi' && (!utrNumber || !paymentDate || !paymentTime || hasPendingRequest)) ||
                  (paymentMethod === 'wallet' && walletBalance < product.price)
                }
                className={`w-full mt-8 py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isSubmitting || 
                  (paymentMethod === 'upi' && (!utrNumber || !paymentDate || !paymentTime || hasPendingRequest)) ||
                  (paymentMethod === 'wallet' && walletBalance < product.price)
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]'
                }`}
              >
                {isSubmitting ? (
                  <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : paymentMethod === 'wallet' ? (
                  <>Pay ₹{product.price} with Wallet</>
                ) : hasPendingRequest ? (
                  <>Payment Request Pending</>
                ) : (
                  <>Submit Payment Details</>
                )}
              </button>
              {paymentMethod === 'upi' && hasPendingRequest && (
                <p className="text-orange-500 text-sm mt-2 text-center">You already have a pending payment request for this product.</p>
              )}
            </div>
          </div>

          {!isVip && (
            <div className="lg:col-span-2">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-24">
                <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
                
                <div className="flex gap-4 mb-6 pb-6 border-b border-gray-800">
                  <img src={product.image_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80'} alt={product.name} className="w-20 h-20 rounded-lg object-cover" />
                  <div>
                    <h4 className="font-bold text-white mb-1 leading-tight">{product.name}</h4>
                    <p className="text-xs text-orange-500 font-medium">Elite Growth Resource</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white font-medium">₹{product.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Processing Fee</span>
                    <span className="text-green-500 font-medium">Free</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                  <span className="text-gray-300 font-medium">Total Amount</span>
                  <span className="text-3xl font-black text-white">₹{product.price}</span>
                </div>

                <div className="bg-black border border-gray-800 rounded-xl p-4 flex gap-3">
                  <ShieldCheck className="w-6 h-6 text-green-500 shrink-0" />
                  <div>
                    <h5 className="text-sm font-bold text-white mb-1">Secure Transaction</h5>
                    <p className="text-xs text-gray-500">Your payments are verified manually by our team to ensure safety.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

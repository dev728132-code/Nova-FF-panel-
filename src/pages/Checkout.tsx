import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Upload, ShieldCheck, ArrowLeft, QrCode, AlertCircle } from 'lucide-react';
import { Product, Plan } from '../types';
import { useScrollTop } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Checkout() {
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

  const state = location.state as { product: Product; selectedPlan: Plan } | null;

  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  
  useEffect(() => {
    if (user && state?.product) {
      let mounted = true;
      const checkPending = async () => {
        try {
          const { data } = await supabase
            .from('orders')
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

      // 1. Polling fallback to check if status gets approved or rejected
      const interval = setInterval(checkPending, 4000);

      // 2. Real-time subscription to instantly update the button state
      const channel = supabase
        .channel(`orders_checkout_${user.id}_${state.product.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
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
        <p className="text-gray-400 mb-8 max-w-md">Please select a product from the store before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/buy')}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors"
        >
          Go to Store
        </button>
      </div>
    );
  }

  const { product, selectedPlan } = state;
  const upiId = "7563075001@ybl";

  const handleConfirm = async () => {
    if (!user) {
      alert("Please login first to make a purchase.");
      navigate('/auth');
      return;
    }
    if (!utrNumber || !paymentDate || !paymentTime) {
      alert("Please fill in UTR/Transaction ID, Date, and Time.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      let screenshotUrl = null;
      if (file) {
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

      const { error: insertError } = await supabase.from('orders').insert({
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        plan_duration: selectedPlan.duration,
        amount: selectedPlan.price,
        payment_status: 'Pending',
        order_status: 'Pending',
        expiry_date: new Date(Date.now() + parseInt(selectedPlan.duration.split(' ')[0]) * 24 * 60 * 60 * 1000).toISOString(),
        payment_screenshot_url: screenshotUrl,
        utr_number: utrNumber,
        payment_date: paymentDate,
        payment_time: paymentTime,
        customer_name: customerName,
        customer_email: user.email
      });

      if (insertError) throw insertError;

      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      alert('Error processing order: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle className="w-12 h-12 text-green-500" />
        </motion.div>
        <h2 className="text-4xl font-black text-white mb-4 text-center">Order Submitted!</h2>
        <p className="text-gray-400 text-center max-w-md mb-8 leading-relaxed">
          Payment request submitted successfully. Please wait while the admin verifies your payment. You will be notified once it is approved or rejected.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/history')}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors"
          >
            View Order Status
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gray-900 border border-gray-700 hover:bg-gray-800 text-white rounded-xl font-bold transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Column - Payment Details */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <QrCode className="w-6 h-6 text-orange-500" /> Payment Details
              </h2>
              
              <div className="bg-black border border-orange-500/30 rounded-xl p-6 mb-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5" />
                <p className="text-sm text-gray-400 mb-2 relative z-10">Scan QR or Copy UPI ID</p>
                <div className="text-2xl md:text-3xl font-mono font-bold text-white mb-4 relative z-10">
                  {upiId}
                </div>
                <div className="bg-white p-4 rounded-xl inline-block mb-4 relative z-10">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}&pn=FF%20Store&am=${selectedPlan.price}&cu=INR`} 
                    alt="UPI QR Code" 
                    className="w-48 h-48"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-xs text-gray-500 relative z-10">Please pay exactly ₹{selectedPlan.price}</p>
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

              <button
                onClick={handleConfirm}
                disabled={isSubmitting || !utrNumber || !paymentDate || !paymentTime || hasPendingRequest}
                className={`w-full mt-8 py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isSubmitting || !utrNumber || !paymentDate || !paymentTime || hasPendingRequest
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]'
                }`}
              >
                {isSubmitting ? (
                  <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : hasPendingRequest ? (
                  <>Payment Request Pending</>
                ) : (
                  <>Submit Payment Details</>
                )}
              </button>
              {hasPendingRequest && (
                <p className="text-orange-500 text-sm mt-2 text-center">You already have a pending payment request for this product.</p>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
              
              <div className="flex gap-4 mb-6 pb-6 border-b border-gray-800">
                <img src={product.image} alt={product.name} className="w-20 h-20 rounded-lg object-cover" />
                <div>
                  <h4 className="font-bold text-white mb-1 leading-tight">{product.name}</h4>
                  <p className="text-xs text-orange-500 font-medium">{selectedPlan.duration} Plan</p>
                </div>
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-medium">₹{selectedPlan.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Processing Fee</span>
                  <span className="text-green-500 font-medium">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-gray-300 font-medium">Total Amount</span>
                <span className="text-3xl font-black text-white">₹{selectedPlan.price}</span>
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

        </div>
      </div>
    </div>
  );
}

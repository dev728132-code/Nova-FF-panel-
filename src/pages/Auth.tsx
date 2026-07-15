import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Mail, User, Phone, ArrowRight, Crosshair, AlertTriangle } from 'lucide-react';
import { supabase, isConfigValid } from '../lib/supabase';
import { useScrollTop } from '../hooks';
import { useAuth } from '../contexts/AuthContext';

export function Auth() {
  useScrollTop();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const isOwner = user.email === 'dev7287132@gmail.com' || user.email === 'dev728132@gmail.com' || user.email === 'tkjdjdsjjs@gmail.com';
      if (isOwner) {
        setSuccessMessage('Owner login detected.');
        const timer = setTimeout(() => {
          navigate('/admin');
        }, 1200);
        return () => clearTimeout(timer);
      } else {
        navigate('/profile');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        setSuccessMessage('Password reset link sent! Please check your email inbox.');
      } else if (isLogin) {
        const isTargetAdmin = email === 'dev7287132@gmail.com' || email === 'dev728132@gmail.com';
        const isNewAdmin = email === 'tkjdjdsjjs@gmail.com';
        if ((isTargetAdmin && password === '929w9nm') || (isNewAdmin && password === '78MKLADMIN09')) {
          // If trying to sign in as the designated admin with correct password
          try {
            const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (signInError) {
              // Automatically register the admin account if it does not exist yet
              const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
                email,
                password,
                options: {
                  data: {
                    full_name: isNewAdmin ? 'System Admin' : 'Admin Owner',
                    phone: '',
                  },
                },
              });
              if (signUpError) throw signUpError;
              
              // Sign in again
              const { error: retrySignIn, data: retryData } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              if (retrySignIn) throw retrySignIn;

              if (retryData?.user) {
                await supabase.from('profiles').update({ role: 'admin', email: email }).eq('id', retryData.user.id);
              }
            } else {
              if (signInData?.user) {
                await supabase.from('profiles').update({ role: 'admin', email: email }).eq('id', signInData.user.id);
              }
            }
          } catch (err: any) {
            throw err;
          }
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
        }
      } else {
        if (email === 'dev7287132@gmail.com' || email === 'dev728132@gmail.com' || email === 'tkjdjdsjjs@gmail.com') {
          throw new Error('This email is reserved for Admin.');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
            },
          },
        });
        if (error) throw error;
        
        if (!data.session) {
          setSuccessMessage('Account created! Please check your email to verify your account.');
          
          try {
            await supabase.from('admin_notifications').insert({
              type: 'New User',
              message: `New user registered: ${email} (${fullName})`
            });
          } catch (e) {
            console.error(e);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-6 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            <Crosshair className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            {isForgotPassword 
              ? 'Reset Password' 
              : isLogin 
                ? 'Welcome Back' 
                : 'Create Account'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isForgotPassword
              ? 'Enter your email address to receive a recovery link'
              : isLogin 
                ? 'Enter your details to access your panels' 
                : 'Register to get access to premium FF panels'}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
          {/* Suppress crashes with graceful configurations check warning */}
          {!isConfigValid && (
            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 text-xs font-medium leading-relaxed flex gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <strong className="block text-sm text-orange-400 mb-0.5">Configuration Warning</strong>
                An invalid Supabase API Key was detected. The application is running in fallback security mode.
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium text-center">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && !isForgotPassword && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-400">Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs text-orange-500 hover:text-orange-400 transition-colors font-semibold"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-6 ${
                loading
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]'
              }`}
            >
              {loading ? (
                <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isForgotPassword 
                    ? 'Send Link' 
                    : isLogin 
                      ? 'Sign In' 
                      : 'Create Account'} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setIsLogin(true);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-orange-500 font-bold hover:text-orange-400 transition-colors text-sm"
              >
                Back to Sign In
              </button>
            ) : (
              <p className="text-gray-400 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-orange-500 font-bold hover:text-orange-400 transition-colors"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

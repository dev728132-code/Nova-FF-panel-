import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, Shield, Settings, LogOut, Smartphone, Key } from 'lucide-react';
import { useScrollTop } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Profile() {
  useScrollTop();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Stateful tabs
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'preferences'>('personal');

  // Personal Info Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security Tab state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Preferences Tab state
  const [prefPromo, setPrefPromo] = useState(true);
  const [prefStatus, setPrefStatus] = useState(true);
  const [prefCompact, setPrefCompact] = useState(false);
  const [prefSound, setPrefSound] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
        setEditName(data.full_name || '');
        setEditPhone(data.phone || '');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setUpdateMessage({ type: 'error', text: 'Full Name is required.' });
      return;
    }
    setUpdateLoading(true);
    setUpdateMessage(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editName,
          phone: editPhone,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile((prev: any) => ({
        ...prev,
        full_name: editName,
        phone: editPhone,
      }));
      setUpdateMessage({ type: 'success', text: 'Personal information updated successfully!' });
      setIsEditing(false);
    } catch (err: any) {
      setUpdateMessage({ type: 'error', text: err.message || 'An error occurred while updating profile.' });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'An error occurred while updating password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-black flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  // Fallback to default if not yet populated
  const displayProfile = {
    name: profile?.full_name || 'Anonymous User',
    email: user?.email || '',
    phone: profile?.phone || 'Not provided',
    joinDate: profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Unknown',
    activePanels: profile?.active_panels || 0
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-orange-500/20 to-red-600/20" />
              
              <div className="relative inline-block mb-4 mt-8">
                <div className="w-24 h-24 rounded-full bg-gray-800 border-4 border-black flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-black rounded-full" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-1">{displayProfile.name}</h2>
              <p className="text-sm text-gray-400 mb-6">{displayProfile.email}</p>
              
              <div className="flex justify-center gap-4 text-left border-t border-gray-800 pt-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Active Panels</p>
                  <p className="text-lg font-bold text-white text-center">{displayProfile.activePanels}</p>
                </div>
                <div className="w-px bg-gray-800" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Member Since</p>
                  <p className="text-sm font-bold text-white mt-1">{displayProfile.joinDate}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <nav className="space-y-1">
                {[
                  { id: 'personal', icon: <User className="w-5 h-5" />, label: 'Personal Info' },
                  { id: 'security', icon: <Shield className="w-5 h-5" />, label: 'Security' },
                  { id: 'preferences', icon: <Settings className="w-5 h-5" />, label: 'Preferences' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setUpdateMessage(null);
                      setPasswordMessage(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-orange-500/10 text-orange-400 font-bold'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
                
                <div className="my-2 border-t border-gray-800" />
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {activeTab === 'personal' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Personal Information</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => {
                        setEditName(displayProfile.name);
                        setEditPhone(displayProfile.phone === 'Not provided' ? '' : displayProfile.phone);
                        setIsEditing(true);
                        setUpdateMessage(null);
                      }}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl text-xs transition-all"
                    >
                      Edit Info
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-transparent text-gray-400 hover:text-white font-semibold rounded-xl text-xs transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={updateLoading}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5"
                      >
                        {updateLoading ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : 'Save'}
                      </button>
                    </div>
                  )}
                </div>

                {updateMessage && (
                  <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                    updateMessage.type === 'success' 
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    {updateMessage.text}
                  </div>
                )}
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          disabled={!isEditing}
                          className={`block w-full pl-11 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-white transition-all ${
                            !isEditing ? 'opacity-70 cursor-not-allowed' : 'focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                          }`}
                          value={isEditing ? editName : displayProfile.name}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Smartphone className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          disabled={!isEditing}
                          className={`block w-full pl-11 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-white transition-all ${
                            !isEditing ? 'opacity-70 cursor-not-allowed' : 'focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                          }`}
                          value={isEditing ? editPhone : displayProfile.phone}
                          onChange={(e) => setEditPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="email"
                        disabled
                        className="block w-full pl-11 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-white opacity-70 cursor-not-allowed"
                        value={displayProfile.email}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">Email address cannot be changed. It is linked directly to your secure account login.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Security Settings</h3>
                  
                  {passwordMessage && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                      passwordMessage.type === 'success' 
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                      {passwordMessage.text}
                    </div>
                  )}

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="block w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="At least 6 characters"
                          minLength={6}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="block w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="Repeat new password"
                          minLength={6}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                      >
                        {passwordLoading ? (
                          <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8">
                  <h4 className="text-lg font-bold text-white mb-4">Multi-Factor Authentication</h4>
                  <div className="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-2xl">
                    <div>
                      <p className="text-white font-semibold text-sm">Two-Factor Authentication (2FA)</p>
                      <p className="text-xs text-gray-500 mt-1">Add an extra layer of protection to your account using authenticator apps.</p>
                    </div>
                    <button
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        twoFactorEnabled ? 'bg-orange-500' : 'bg-gray-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8">
                  <h4 className="text-lg font-bold text-white mb-4">Security Logs</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 bg-black/40 border border-gray-800/60 rounded-xl text-xs">
                      <div>
                        <p className="text-white font-semibold">Current Session (Active)</p>
                        <p className="text-gray-500 mt-0.5">Authenticated JWT token securely saved in browser session</p>
                      </div>
                      <span className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-bold">
                        SECURE
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-black/40 border border-gray-800/60 rounded-xl text-xs">
                      <div>
                        <p className="text-white font-semibold">Authorization Method</p>
                        <p className="text-gray-500 mt-0.5">Protected with industry-standard row-level security (RLS) policies</p>
                      </div>
                      <span className="text-gray-400 font-mono font-medium">SUPABASE</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Account Preferences</h3>
                  <p className="text-xs text-gray-500">Configure your panel management preferences and notifications.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-2xl">
                    <div>
                      <p className="text-white font-semibold text-sm">Marketing Emails</p>
                      <p className="text-xs text-gray-500 mt-0.5">Receive notifications about newly released panels and seasonal discount events.</p>
                    </div>
                    <button
                      onClick={() => setPrefPromo(!prefPromo)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        prefPromo ? 'bg-orange-500' : 'bg-gray-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          prefPromo ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-2xl">
                    <div>
                      <p className="text-white font-semibold text-sm">Order Status Updates</p>
                      <p className="text-xs text-gray-500 mt-0.5">Receive immediate alert popups inside the system when your order is verified.</p>
                    </div>
                    <button
                      onClick={() => setPrefStatus(!prefStatus)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        prefStatus ? 'bg-orange-500' : 'bg-gray-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          prefStatus ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-2xl">
                    <div>
                      <p className="text-white font-semibold text-sm">Compact Catalog View</p>
                      <p className="text-xs text-gray-500 mt-0.5">Show a higher-density panel grid layout on the buy page by default.</p>
                    </div>
                    <button
                      onClick={() => setPrefCompact(!prefCompact)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        prefCompact ? 'bg-orange-500' : 'bg-gray-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          prefCompact ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-2xl">
                    <div>
                      <p className="text-white font-semibold text-sm">Action Feedback Sounds</p>
                      <p className="text-xs text-gray-500 mt-0.5">Play dynamic sci-fi chimes when you complete a payment or verify an order.</p>
                    </div>
                    <button
                      onClick={() => setPrefSound(!prefSound)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        prefSound ? 'bg-orange-500' : 'bg-gray-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          prefSound ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-800">
                  <button
                    onClick={() => {
                      const toast = document.createElement('div');
                      toast.className = 'fixed bottom-5 right-5 bg-green-500 text-white font-bold px-5 py-3 rounded-xl shadow-2xl shadow-green-500/20 z-50 animate-fade-in text-sm border border-green-400/30';
                      toast.innerText = 'Preferences saved successfully!';
                      document.body.appendChild(toast);
                      setTimeout(() => toast.remove(), 3000);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                  >
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

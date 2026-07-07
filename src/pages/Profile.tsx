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
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
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
                  { icon: <User className="w-5 h-5" />, label: 'Personal Info', active: true },
                  { icon: <Shield className="w-5 h-5" />, label: 'Security' },
                  { icon: <Settings className="w-5 h-5" />, label: 'Preferences' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      item.active
                        ? 'bg-orange-500/10 text-orange-400'
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
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
              
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
                        disabled
                        className="block w-full pl-11 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-white opacity-70 cursor-not-allowed"
                        value={displayProfile.name}
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
                        disabled
                        className="block w-full pl-11 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-white opacity-70 cursor-not-allowed"
                        value={displayProfile.phone}
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
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-6">Security</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                      <Key className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Password</p>
                      <p className="text-sm text-gray-500">Managed via Supabase Auth</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-gray-700 hover:border-gray-600 rounded-lg text-sm text-white font-medium transition-colors">
                    Update
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

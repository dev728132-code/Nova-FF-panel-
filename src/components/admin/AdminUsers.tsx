import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';
import { Users, Search, Shield, Ban, CheckCircle, Clock } from 'lucide-react';
import { AdminResellerPrices } from './AdminResellerPrices';

export function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [view, setView] = useState<'list' | 'prices'>('list');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert('Failed to update role: ' + error.message);
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string, days?: number) => {
    let suspendedUntil = null;
    if (newStatus === 'suspended' && days) {
      const date = new Date();
      date.setDate(date.getDate() + days);
      suspendedUntil = date.toISOString();
    }

    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus, suspended_until: suspendedUntil })
      .eq('id', userId);

    if (error) {
      alert('Failed to update status: ' + error.message);
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus as any, suspended_until: suspendedUntil } : u));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) {
      alert('Error deleting profile (you may need to delete from auth.users separately): ' + error.message);
    } else {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.id.includes(search)
  );

  if (view === 'prices' && selectedUser) {
    return (
      <AdminResellerPrices 
        reseller={selectedUser} 
        onBack={() => setView('list')} 
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-orange-500" /> User & Reseller Management
        </h2>
        <div className="relative w-full md:w-64">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <span className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin inline-block"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{user.full_name || 'Anonymous User'}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                    user.role === 'admin' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                    user.role === 'reseller' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                    'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {user.role || 'user'}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                    user.status === 'active' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                    user.status === 'banned' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                    'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                  }`}>
                    {user.status || 'active'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-400">
                  <p>Email: <span className="text-gray-300 font-mono">{user.email || 'N/A'}</span></p>
                  <p>ID: <span className="text-gray-300 font-mono text-xs">{user.id}</span></p>
                  <p>Joined: <span className="text-gray-300">{new Date(user.created_at).toLocaleDateString()}</span></p>
                  <p>Last Login: <span className="text-gray-300">{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</span></p>
                </div>
                
                {user.status === 'suspended' && user.suspended_until && (
                  <p className="text-yellow-500 text-xs mt-2 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Suspended until: {new Date(user.suspended_until).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                {/* Reseller Controls */}
                {user.role !== 'reseller' ? (
                  <button onClick={() => handleUpdateRole(user.id, 'reseller')} className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-500 border border-orange-500/30 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1">
                    <Shield className="w-4 h-4" /> Make Reseller
                  </button>
                ) : (
                  <>
                    <button onClick={() => handleUpdateRole(user.id, 'user')} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1">
                      Remove Reseller
                    </button>
                    <button onClick={() => { setSelectedUser(user); setView('prices'); }} className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-500 border border-green-500/30 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1">
                      Manage Prices
                    </button>
                  </>
                )}

                {/* Status Controls */}
                {user.status === 'banned' ? (
                  <button onClick={() => handleUpdateStatus(user.id, 'active')} className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-500 border border-green-500/30 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Unban
                  </button>
                ) : (
                  <button onClick={() => handleUpdateStatus(user.id, 'banned')} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1">
                    <Ban className="w-4 h-4" /> Ban
                  </button>
                )}

                {user.status !== 'suspended' && (
                  <button onClick={() => {
                    const days = prompt('Enter number of days to suspend this user:');
                    if (days && !isNaN(Number(days))) {
                      handleUpdateStatus(user.id, 'suspended', Number(days));
                    }
                  }} className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/30 rounded-lg text-sm font-semibold transition-colors">
                    Suspend
                  </button>
                )}
                {user.status === 'suspended' && (
                  <button onClick={() => handleUpdateStatus(user.id, 'active')} className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/30 rounded-lg text-sm font-semibold transition-colors">
                    Remove Suspension
                  </button>
                )}

                <button onClick={() => handleDeleteUser(user.id)} className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded-lg text-sm font-semibold transition-colors">
                  Delete
                </button>
              </div>

            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center py-10 text-gray-500 bg-gray-900 border border-gray-800 rounded-2xl">
              No users found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

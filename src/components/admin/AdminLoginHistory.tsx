import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { LoginHistory } from '../../types';
import { Activity, Globe, Monitor, Search } from 'lucide-react';

export function AdminLoginHistory() {
  const [history, setHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('login_history')
      .select('*, profiles(email, full_name)')
      .order('login_time', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching login history:', error);
    } else {
      setHistory(data as any || []);
    }
    setLoading(false);
  };

  const filteredHistory = history.filter(h => 
    h.profiles?.email?.toLowerCase().includes(search.toLowerCase()) || 
    h.ip_address?.includes(search) ||
    h.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-orange-500" /> Recent Logins
        </h2>
        <div className="relative w-full md:w-64">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search email or IP..."
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
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800 bg-black/50">
                  <th className="p-4 text-sm font-semibold text-gray-400">User</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Time</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">IP & Location</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Device Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredHistory.map(h => (
                  <tr key={h.id} className="hover:bg-black/20">
                    <td className="p-4">
                      <div className="font-bold text-white">{h.profiles?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-gray-400 font-mono">{h.profiles?.email || h.user_id.slice(0, 8) + '...'}</div>
                    </td>
                    <td className="p-4 text-gray-300 text-sm">
                      {new Date(h.login_time).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-orange-500 text-sm font-mono mb-1">
                        <Globe className="w-3.5 h-3.5" /> {h.ip_address || 'Unknown IP'}
                      </div>
                      <div className="text-xs text-gray-500">{h.location || 'Unknown Location'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-gray-300 text-sm mb-1">
                        <Monitor className="w-3.5 h-3.5" /> {h.device || 'Unknown Device'}
                      </div>
                      <div className="text-xs text-gray-500">{h.browser || 'Unknown Browser'}</div>
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No login records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

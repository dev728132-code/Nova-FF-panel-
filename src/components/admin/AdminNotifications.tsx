import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminNotification } from '../../types';
import { Bell, CheckCircle, Trash2 } from 'lucide-react';

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('admin_notifications_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
        (payload) => {
          setNotifications(prev => [payload.new as AdminNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setNotifications(data);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from('admin_notifications').update({ is_read: true }).eq('id', id);
    if (!error) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const markAllAsRead = async () => {
    const { error } = await supabase.from('admin_notifications').update({ is_read: true }).eq('is_read', false);
    if (!error) {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    }
  };

  const deleteAll = async () => {
    // Remove confirm to avoid iframe blocking
    const { error } = await supabase.from('admin_notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (!error) {
      setNotifications([]);
    } else {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-orange-500" /> Notifications
        </h2>
        <div className="flex gap-3">
          <button onClick={markAllAsRead} className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
            Mark all as read
          </button>
          <button onClick={deleteAll} className="text-sm font-semibold text-red-500 hover:text-red-400 transition-colors">
            Clear all
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <span className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin inline-block"></span>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div key={notification.id} className={`p-4 rounded-xl border flex items-start gap-4 transition-colors ${notification.is_read ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-900 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]'}`}>
              <div className={`mt-1 p-2 rounded-full ${notification.is_read ? 'bg-gray-800 text-gray-500' : 'bg-orange-500/20 text-orange-500'}`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-bold ${notification.is_read ? 'text-gray-300' : 'text-white'}`}>{notification.type}</h4>
                  <span className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleString()}</span>
                </div>
                <p className={`${notification.is_read ? 'text-gray-500' : 'text-gray-300'} text-sm`}>{notification.message}</p>
              </div>
              {!notification.is_read && (
                <button onClick={() => markAsRead(notification.id)} className="text-gray-500 hover:text-green-500 transition-colors p-1" title="Mark as read">
                  <CheckCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-10 text-gray-500 bg-gray-900 border border-gray-800 rounded-2xl">
              No notifications yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

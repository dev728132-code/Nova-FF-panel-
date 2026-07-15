import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserMessage } from '../types';
import { Bell, X, Check, Mail, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function UserNotifications() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchMessages();
      
      const channel = supabase
        .channel('user_messages_channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'user_messages', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setMessages(prev => [payload.new as UserMessage, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast for new message
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-5 right-5 bg-orange-500 text-white font-bold px-5 py-4 rounded-xl shadow-2xl z-50 animate-fade-in text-sm border border-orange-400/30 flex flex-col gap-1';
            toast.innerHTML = `<span class="uppercase tracking-wider text-[10px] text-white/80 font-black">New Message</span><span class="text-base">${payload.new.title}</span>`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 5000);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    
    // Filter out expired messages
    const { data, error } = await supabase
      .from('user_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user messages:', error);
      return;
    }

    if (data) {
      const now = new Date().getTime();
      const validMessages = data.filter(msg => {
        if (!msg.expires_at) return true;
        return new Date(msg.expires_at).getTime() > now;
      });
      
      setMessages(validMessages);
      setUnreadCount(validMessages.filter(m => !m.is_read).length);
    }
  };

  const markAsRead = async (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (!msg || msg.is_read) return;

    // Optimistic update
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    setUnreadCount(prev => Math.max(0, prev - 1));

    await supabase.from('user_messages').update({ is_read: true }).eq('id', id);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  if (!user) return null;

  return (
    <div className="relative z-50">
      <button 
        onClick={toggleOpen}
        className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-black">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-black/50">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-orange-500" /> Notifications
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800/50">
                    {messages.map(msg => (
                      <div 
                        key={msg.id} 
                        onClick={() => markAsRead(msg.id)}
                        className={`p-4 transition-colors cursor-pointer hover:bg-gray-800/50 ${!msg.is_read ? 'bg-orange-500/5' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h4 className={`font-bold text-sm ${!msg.is_read ? 'text-white' : 'text-gray-300'}`}>
                            {msg.title}
                          </h4>
                          {!msg.is_read && (
                            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className={`text-sm whitespace-pre-wrap ${!msg.is_read ? 'text-gray-300' : 'text-gray-500'}`}>
                          {msg.message}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                          {msg.expires_at && (
                            <span className="text-[10px] font-medium text-gray-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Exp: {new Date(msg.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

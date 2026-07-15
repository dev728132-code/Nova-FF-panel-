import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserMessage } from '../../types';
import { Search, Trash2, RotateCcw, Clock, CheckCircle } from 'lucide-react';

export function AdminSentMessages() {
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingMsg, setEditingMsg] = useState<UserMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_messages')
      .select('*, profiles:user_id(full_name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    const { error } = await supabase.from('user_messages').delete().eq('id', id);
    if (error) {
      alert('Error deleting message: ' + error.message);
    } else {
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleResend = async (msg: UserMessage) => {
    if (!confirm('Are you sure you want to resend this message?')) return;
    
    const { error } = await supabase.from('user_messages').insert({
      user_id: msg.user_id,
      title: msg.title,
      message: msg.message,
      expires_at: msg.expires_at
    });

    if (error) {
      alert('Error resending message: ' + error.message);
    } else {
      fetchMessages();
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-5 right-5 bg-green-500 text-white font-bold px-5 py-3 rounded-xl shadow-2xl z-50 animate-fade-in text-sm border border-green-400/30';
      toast.innerText = 'Message resent successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  const filteredMessages = messages.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.message.toLowerCase().includes(search.toLowerCase()) ||
    m.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
           Sent Messages
        </h2>
        <div className="relative w-full md:w-64">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <span className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin inline-block"></span>
        </div>
      ) : filteredMessages.length > 0 ? (
        <div className="grid gap-4">
          {filteredMessages.map(msg => {
            const isExpired = msg.expires_at && new Date(msg.expires_at) < new Date();
            return (
              <div key={msg.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-white">{msg.title}</h3>
                      {msg.is_read ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Read
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                          Unread
                        </span>
                      )}
                      {isExpired && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                          Expired
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm whitespace-pre-wrap">{msg.message}</p>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 mt-2">
                      <span>To: <span className="text-orange-500">{msg.profiles?.email || 'Unknown User'}</span></span>
                      <span>Sent: {new Date(msg.created_at).toLocaleString()}</span>
                      {msg.expires_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Expires: {new Date(msg.expires_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                    
                    <button 
                      onClick={() => setEditingMsg(msg)}
                      className="flex-1 md:flex-none px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg> Edit
                    </button>
                    <button 
                      onClick={() => handleResend(msg)}
                      className="flex-1 md:flex-none px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-4 h-4" /> Resend
                    </button>
                    <button 
                      onClick={() => handleDelete(msg.id)}
                      className="flex-1 md:flex-none px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-xl">
          <p className="text-gray-500">No sent messages found.</p>
        </div>
      )}
    
      {editingMsg && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6">
            <h3 className="font-bold text-lg text-white mb-4">Edit Message</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Title</label>
                <input
                  type="text"
                  value={editingMsg.title}
                  onChange={e => setEditingMsg({...editingMsg, title: e.target.value})}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Message</label>
                <textarea
                  rows={4}
                  value={editingMsg.message}
                  onChange={e => setEditingMsg({...editingMsg, message: e.target.value})}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white resize-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setEditingMsg(null)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const { error } = await supabase.from('user_messages').update({
                      title: editingMsg.title,
                      message: editingMsg.message
                    }).eq('id', editingMsg.id);
                    if (error) alert('Error updating: ' + error.message);
                    else {
                      setEditingMsg(null);
                      fetchMessages();
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


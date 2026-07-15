import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';
import { X, Send, Calendar, Clock } from 'lucide-react';

interface Props {
  user: Profile;
  onClose: () => void;
  onSuccess: () => void;
}

export function SendMessageModal({ user, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [expiryType, setExpiryType] = useState('1h');
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [sending, setSending] = useState(false);

  const expiryOptions = [
    { label: '1 Hour', value: '1h', hours: 1 },
    { label: '2 Hours', value: '2h', hours: 2 },
    { label: '6 Hours', value: '6h', hours: 6 },
    { label: '12 Hours', value: '12h', hours: 12 },
    { label: '24 Hours', value: '24h', hours: 24 },
    { label: '3 Days', value: '3d', hours: 72 },
    { label: '7 Days', value: '7d', hours: 168 },
    { label: 'Custom', value: 'custom', hours: 0 },
    { label: 'Never Expires', value: 'never', hours: -1 }
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    setSending(true);

    let expiresAt = null;
    const selectedOption = expiryOptions.find(o => o.value === expiryType);

    if (expiryType === 'custom') {
      if (customDate && customTime) {
        expiresAt = new Date(`${customDate}T${customTime}`).toISOString();
      }
    } else if (selectedOption && selectedOption.hours > 0) {
      const d = new Date();
      d.setHours(d.getHours() + selectedOption.hours);
      expiresAt = d.toISOString();
    }

    const { error } = await supabase.from('user_messages').insert({
      user_id: user.id,
      title,
      message,
      expires_at: expiresAt
    });

    setSending(false);

    if (error) {
      alert('Error sending message: ' + error.message);
    } else {
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-5 right-5 bg-green-500 text-white font-bold px-5 py-3 rounded-xl shadow-2xl z-50 animate-fade-in text-sm border border-green-400/30';
      toast.innerText = 'Message sent successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-black/50">
          <h3 className="font-bold text-lg text-white">Send Message to User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSend} className="p-6 space-y-4">
          <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50 flex flex-col mb-4">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Recipient</span>
            <span className="text-white font-medium">{user.full_name || 'Unnamed User'}</span>
            <span className="text-sm text-gray-500">{user.email || 'No email'}</span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Message Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="e.g. Account Update, Warning, Notice"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Message Description</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
              placeholder="Write your message here..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Expiry Time</label>
            <select
              value={expiryType}
              onChange={e => setExpiryType(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors mb-3"
            >
              {expiryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {expiryType === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Date</label>
                  <input
                    type="date"
                    required
                    value={customDate}
                    onChange={e => setCustomDate(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Time</label>
                  <input
                    type="time"
                    required
                    value={customTime}
                    onChange={e => setCustomTime(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {sending ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : <Send className="w-4 h-4" />}
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

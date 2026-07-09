import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PromoCode } from '../../types';
import { Tag, Plus, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';

export function AdminPromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCode, setCurrentCode] = useState<Partial<PromoCode>>({ is_active: true });

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
    if (data) setPromoCodes(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCode.code) return;

    if (currentCode.id) {
      const { error } = await supabase.from('promo_codes').update(currentCode).eq('id', currentCode.id);
      if (!error) {
        setPromoCodes(promoCodes.map(c => c.id === currentCode.id ? { ...c, ...currentCode } as PromoCode : c));
      }
    } else {
      const { data, error } = await supabase.from('promo_codes').insert([currentCode]).select();
      if (!error && data) {
        setPromoCodes([data[0], ...promoCodes]);
      } else if (error) {
        alert('Error: ' + error.message);
      }
    }
    setIsEditing(false);
    setCurrentCode({ is_active: true });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete promo code?')) return;
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (!error) {
      setPromoCodes(promoCodes.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Tag className="w-6 h-6 text-orange-500" /> Promo Codes
        </h2>
        <button
          onClick={() => { setIsEditing(true); setCurrentCode({ is_active: true }); }}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> New Code
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 animate-fade-in">
          <h3 className="text-lg font-bold text-white mb-4">{currentCode.id ? 'Edit' : 'Create'} Promo Code</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Code Name</label>
              <input type="text" required value={currentCode.code || ''} onChange={e => setCurrentCode({...currentCode, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2 bg-black border border-gray-800 rounded-xl text-white uppercase focus:border-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Discount %</label>
              <input type="number" min="0" max="100" value={currentCode.discount_percentage || ''} onChange={e => setCurrentCode({...currentCode, discount_percentage: Number(e.target.value)})} className="w-full px-4 py-2 bg-black border border-gray-800 rounded-xl text-white focus:border-orange-500 outline-none" placeholder="e.g. 20" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Fixed Discount (₹)</label>
              <input type="number" min="0" value={currentCode.fixed_discount || ''} onChange={e => setCurrentCode({...currentCode, fixed_discount: Number(e.target.value)})} className="w-full px-4 py-2 bg-black border border-gray-800 rounded-xl text-white focus:border-orange-500 outline-none" placeholder="e.g. 100" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Usage Limit</label>
              <input type="number" min="1" value={currentCode.usage_limit || ''} onChange={e => setCurrentCode({...currentCode, usage_limit: Number(e.target.value)})} className="w-full px-4 py-2 bg-black border border-gray-800 rounded-xl text-white focus:border-orange-500 outline-none" placeholder="Leave empty for unlimited" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Expiry Date</label>
              <input type="datetime-local" value={currentCode.expiry_date ? new Date(currentCode.expiry_date).toISOString().slice(0,16) : ''} onChange={e => setCurrentCode({...currentCode, expiry_date: new Date(e.target.value).toISOString()})} className="w-full px-4 py-2 bg-black border border-gray-800 rounded-xl text-white focus:border-orange-500 outline-none" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="active" checked={currentCode.is_active} onChange={e => setCurrentCode({...currentCode, is_active: e.target.checked})} className="w-4 h-4 accent-orange-500" />
              <label htmlFor="active" className="text-gray-300">Active</label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-6 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-500 font-bold border border-green-500/30 rounded-xl transition-all">Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-all">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10">
          <span className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin inline-block"></span>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 bg-black/50">
                <th className="p-4 text-sm font-semibold text-gray-400">Code</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Discount</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Usage</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Expiry</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {promoCodes.map(code => (
                <tr key={code.id} className="hover:bg-black/20">
                  <td className="p-4 font-bold text-orange-500 font-mono">{code.code}</td>
                  <td className="p-4 text-white font-medium">
                    {code.discount_percentage ? `${code.discount_percentage}% OFF` : ''}
                    {code.discount_percentage && code.fixed_discount ? ' + ' : ''}
                    {code.fixed_discount ? `₹${code.fixed_discount} OFF` : ''}
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {code.times_used} / {code.usage_limit || '∞'}
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {code.expiry_date ? new Date(code.expiry_date).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="p-4">
                    {code.is_active ? <span className="text-green-500 flex items-center gap-1 text-sm"><CheckCircle className="w-4 h-4"/> Active</span> : <span className="text-red-500 flex items-center gap-1 text-sm"><XCircle className="w-4 h-4"/> Disabled</span>}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => { setCurrentCode(code); setIsEditing(true); }} className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors inline-block"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(code.id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors inline-block"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {promoCodes.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No promo codes created yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

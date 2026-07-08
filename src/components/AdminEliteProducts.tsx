import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Star, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

export function AdminEliteProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('elite_growth_products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (editingProduct) {
      await supabase.from('elite_growth_products').update(formData).eq('id', editingProduct.id);
    } else {
      await supabase.from('elite_growth_products').insert([formData]);
    }
    setIsModalOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await supabase.from('elite_growth_products').delete().eq('id', id);
      fetchProducts();
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('elite_growth_products').update({ is_active: !currentStatus }).eq('id', id);
    fetchProducts();
  };

  if (loading) return <div className="text-gray-500 py-10">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Star className="w-5 h-5 text-orange-500"/> Manage Elite Growth Products</h2>
        <button 
          onClick={() => { setEditingProduct(null); setFormData({ name: '', description: '', price: 0, image_url: '', is_active: true }); setIsModalOpen(true); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4"/> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className={`bg-gray-900 border ${p.is_active ? 'border-gray-800' : 'border-red-900/50'} rounded-2xl p-5`}>
            <div className="flex gap-4 mb-4">
              <img src={p.image_url || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-xl object-cover bg-black" />
              <div>
                <h3 className="text-white font-bold">{p.name}</h3>
                <div className="text-orange-500 font-bold">₹{p.price}</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{p.description}</p>
            <div className="flex gap-2">
              <button onClick={() => { setEditingProduct(p); setFormData(p); setIsModalOpen(true); }} className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white"><Edit2 className="w-4 h-4"/></button>
              <button onClick={() => toggleStatus(p.id, p.is_active)} className={`p-2 rounded-lg ${p.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {p.is_active ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
              </button>
              <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg ml-auto"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 p-6 rounded-2xl max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1">Name</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 bg-black border border-gray-800 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Price (₹)</label>
                <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full p-2 bg-black border border-gray-800 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Image URL</label>
                <input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full p-2 bg-black border border-gray-800 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 bg-black border border-gray-800 rounded-lg text-white" rows={3} />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-800 text-white rounded-lg flex-1">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg flex-1">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Star, Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';
import toast from 'react-hot-toast';

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

  
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

    const handleSave = async () => {
    try {
      if (editingProduct) {
        await supabase.from('elite_growth_products').update(formData).eq('id', editingProduct.id);
        toast.success('Product updated successfully!');
      } else {
        await supabase.from('elite_growth_products').insert([formData]);
        toast.success('Product created successfully!');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Error saving product');
    }
  };

    const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await supabase.from('elite_growth_products').delete().eq('id', id);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error: any) {
        toast.error('Failed to delete product');
      }
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-fade-in">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900/95 backdrop-blur z-10 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors p-2 -mr-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body (Scrollable) */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Name <span className="text-red-500">*</span></label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-black border border-gray-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-white outline-none transition-all" placeholder="Product name" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Price (₹) <span className="text-red-500">*</span></label>
                <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full p-3 bg-black border border-gray-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-white outline-none transition-all" placeholder="0" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Image URL</label>
                <div className="flex gap-4">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-12 h-12 rounded-lg object-cover bg-black shrink-0 border border-gray-800" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
                  )}
                  <input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="flex-1 w-full p-3 bg-black border border-gray-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-white outline-none transition-all" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-black border border-gray-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-white outline-none transition-all resize-none" rows={3} placeholder="Product description..." />
              </div>
            </div>
            
            {/* Modal Footer (Sticky) */}
            <div className="p-4 sm:p-6 border-t border-gray-800 bg-gray-900 sticky bottom-0 z-10 rounded-b-2xl flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl flex-1 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={!formData.name || formData.price <= 0} className="px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex-1 transition-colors shadow-lg shadow-orange-500/20">Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

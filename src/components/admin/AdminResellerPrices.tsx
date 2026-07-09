import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Profile, Product, Plan, ResellerPrice } from '../../types';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
  reseller: Profile;
  onBack: () => void;
}

export function AdminResellerPrices({ reseller, onBack }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch all products and plans
    const { data: prodData } = await supabase
      .from('products')
      .select('*, plans(*)');
      
    if (prodData) setProducts(prodData as any);

    // Fetch reseller prices
    const { data: priceData } = await supabase
      .from('reseller_prices')
      .select('*')
      .eq('reseller_id', reseller.id);

    if (priceData) {
      const priceMap: Record<string, number> = {};
      priceData.forEach((p: any) => {
        priceMap[p.plan_id] = p.price;
      });
      setPrices(priceMap);
    }
    setLoading(false);
  };

  const handlePriceChange = (planId: string, price: string) => {
    setPrices({ ...prices, [planId]: Number(price) });
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Convert map to array of records
    const updates = Object.keys(prices).map(planId => ({
      reseller_id: reseller.id,
      plan_id: planId,
      price: prices[planId]
    }));

    if (updates.length > 0) {
      const { error } = await supabase
        .from('reseller_prices')
        .upsert(updates, { onConflict: 'reseller_id,plan_id' });
        
      if (error) {
        alert('Error saving prices: ' + error.message);
      } else {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-5 right-5 bg-green-500 text-white font-bold px-5 py-3 rounded-xl shadow-2xl z-50 animate-fade-in text-sm border border-green-400/30';
        toast.innerText = 'Prices updated successfully!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      }
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">Manage Reseller Prices</h2>
          <p className="text-sm text-orange-500 font-mono">{reseller.full_name} ({reseller.email})</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="ml-auto px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold rounded-xl transition-all flex items-center gap-2"
        >
          {saving ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : <Save className="w-4 h-4" />}
          Save All Prices
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <span className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin inline-block"></span>
        </div>
      ) : (
        <div className="space-y-6">
          {products.map(product => (
            <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-4 bg-black/50 border-b border-gray-800 flex items-center gap-4">
                <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                <h3 className="font-bold text-lg text-white">{product.name}</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.plans?.map(plan => (
                    <div key={plan.id} className="bg-black border border-gray-800 rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-semibold">{plan.duration}</span>
                        <span className="text-gray-500 line-through">Normal: ₹{plan.price}</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 font-bold">₹</span>
                        <input
                          type="number"
                          value={prices[plan.id] || ''}
                          onChange={(e) => handlePriceChange(plan.id, e.target.value)}
                          placeholder={plan.price.toString()}
                          className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 font-mono font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

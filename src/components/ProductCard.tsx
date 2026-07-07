import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, ShieldAlert, ShoppingCart, Zap } from 'lucide-react';
import { Product } from '../types';
import { Link, useNavigate } from 'react-router-dom';

export function ProductCard({ product }: { product: Product }) {
  const [selectedPlanId, setSelectedPlanId] = useState(product.plans?.[0]?.id);
  const navigate = useNavigate();

  if (!product.plans || product.plans.length === 0) {
    return null;
  }

  const selectedPlan = product.plans.find(p => p.id === selectedPlanId) || product.plans[0];
  
  let featuresList: string[] = [];
  try {
    if (Array.isArray(product.features)) {
      featuresList = product.features;
    } else if (typeof product.features === 'string') {
      featuresList = JSON.parse(product.features);
    }
  } catch (e) {
    featuresList = [];
  }

  const handleBuy = () => {
    navigate('/checkout', { state: { product, selectedPlan } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden group hover:border-orange-500/50 transition-colors flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        <div className="absolute top-4 right-4 bg-orange-500/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
          <Zap className="w-3.5 h-3.5 text-white" />
          <span className="text-white text-xs font-bold tracking-wide">PREMIUM</span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-2 leading-tight">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-6 flex-grow">{product.description}</p>

        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-orange-500" /> Features
          </h4>
          <ul className="space-y-2">
            {featuresList.slice(0, 4).map((feature: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
            {featuresList.length > 4 && (
              <li className="text-xs text-orange-400 font-medium pl-6">
                + {featuresList.length - 4} more features
              </li>
            )}
          </ul>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-800">
           <div className="mb-4">
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">Select Duration</label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {product.plans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                    selectedPlanId === plan.id
                      ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {plan.duration}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="block text-xs text-gray-500 font-medium mb-1">Total Price</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">₹</span>
                <span className="text-3xl font-black text-white">{selectedPlan.price}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleBuy}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]"
          >
            <ShoppingCart className="w-5 h-5" />
            Buy Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}

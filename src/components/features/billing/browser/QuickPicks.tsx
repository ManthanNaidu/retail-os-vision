import React from 'react';
import { Product } from '@/types';
import { Sparkles, Plus } from 'lucide-react';

interface QuickPicksProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  cart: { productId: string; quantity: number }[];
}

export function QuickPicks({ products, onAddProduct, cart }: QuickPicksProps) {
  // Simulate AI "Quick Picks" - e.g. top 4 products in stock, maybe frequently bought.
  // We'll just grab the first 4 products that have stock for now.
  const quickPicks = products.filter(p => p.stock > 0).slice(0, 4);

  if (quickPicks.length === 0) return null;

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-[#F79009]" />
        <h3 className="font-extrabold text-[14px] text-[#172033]">Quick Picks</h3>
        <span className="text-[12px] text-[#667085] ml-1">Frequently sold</span>
      </div>

      <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 -mb-2">
        {quickPicks.map(product => {
          const inCart = cart.find(c => c.productId === product.id);
          const qty = inCart?.quantity || 0;
          
          return (
            <button
              key={product.id}
              onClick={() => onAddProduct(product)}
              className="flex-shrink-0 flex items-center gap-3 bg-white border border-[#E9EDF2] rounded-xl p-2 pr-3 hover:border-[#FF8A00] hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-[#F8F9FB] flex items-center justify-center overflow-hidden flex-shrink-0">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[20px]">📦</span>
                )}
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-bold text-[13px] text-[#172033] max-w-[100px] truncate">
                  {product.name}
                </span>
                <span className="font-bold text-[12px] text-[#FF8A00]">
                  ₹{product.sellingPrice}
                </span>
              </div>
              
              <div className="ml-1 w-6 h-6 rounded-full bg-[#F8F9FB] flex items-center justify-center text-[#667085]">
                {qty > 0 ? (
                  <span className="text-[12px] font-black text-[#FF8A00]">{qty}</span>
                ) : (
                  <Plus size={14} strokeWidth={3} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

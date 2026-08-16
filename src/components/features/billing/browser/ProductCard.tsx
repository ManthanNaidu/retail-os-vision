import React from 'react';
import { Product } from '@/types';
import { motion } from 'framer-motion';
import { Package, Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, quantityInCart, onAdd }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const disableAdd = isOutOfStock || (product.stock > 0 && quantityInCart >= product.stock);

  return (
    <motion.div
      whileHover={!disableAdd ? { y: -2, boxShadow: '0 12px 24px -10px rgba(0,0,0,0.08)' } : {}}
      whileTap={!disableAdd ? { scale: 0.98 } : {}}
      onClick={() => {
        if (!disableAdd) onAdd(product);
      }}
      className={`relative bg-white rounded-2xl border p-3 flex flex-col h-full transition-all cursor-pointer overflow-hidden ${
        quantityInCart > 0 
          ? 'border-[#FF8A00] ring-1 ring-[#FF8A00] shadow-sm' 
          : isOutOfStock 
            ? 'border-[#E9EDF2] opacity-60 grayscale'
            : 'border-[#E9EDF2] hover:border-[#D0D5DD]'
      }`}
    >
      {/* Top badges */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-10">
        {isOutOfStock && (
          <span className="bg-[#FEF3F2] text-[#F04438] text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
            Out of stock
          </span>
        )}
        {isLowStock && !isOutOfStock && (
          <span className="bg-[#FFFAEB] text-[#F79009] text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
            Low
          </span>
        )}
      </div>

      <div className="w-full aspect-square bg-[#F8F9FB] rounded-xl mb-3 flex items-center justify-center text-[#D0D5DD] overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Package size={40} strokeWidth={1.5} />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <h3 className="font-extrabold text-[14px] text-[#172033] leading-tight mb-1 line-clamp-2 pr-1">
          {product.name}
        </h3>
        
        <div className="flex items-end justify-between mt-2">
          <div>
            <div className="font-black text-[16px] text-[#FF8A00] leading-none">
              ₹{product.sellingPrice}
            </div>
            {!isOutOfStock && (
              <div className="text-[11px] text-[#667085] font-semibold mt-1">
                Stock: {product.stock}
              </div>
            )}
          </div>
          
          <button
            disabled={disableAdd}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] transition-colors flex-shrink-0 ${
              quantityInCart > 0 
                ? 'bg-[#FF8A00] text-white' 
                : 'bg-[#F8F9FB] text-[#667085] group-hover:bg-[#E9EDF2] group-hover:text-[#172033]'
            }`}
          >
            {quantityInCart > 0 ? quantityInCart : <Plus size={16} strokeWidth={3} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

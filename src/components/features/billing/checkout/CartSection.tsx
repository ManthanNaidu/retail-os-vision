'use client';

import React from 'react';
import { ShoppingCart, Trash2, Minus, Plus, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';

// We use any or import CartItem from types if it exists, but since we know the structure:
export interface CartItem {
  productId: string;
  productName: string;
  image?: string;
  sellingPrice: number;
  quantity: number;
  total: number;
  stock?: number;
}

interface CartSectionProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
  onAddNote: () => void;
}

export function CartSection({
  cart,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onAddNote
}: CartSectionProps) {
  
  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-[24px] shadow-sm border border-[#E9EDF2] p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 bg-[#F8F9FB] rounded-full flex items-center justify-center text-[#D0D5DD] mb-4">
          <ShoppingCart size={28} />
        </div>
        <h3 className="text-[#172033] font-extrabold text-[16px] mb-1">Your cart is empty</h3>
        <p className="text-[#667085] text-[13px] text-center max-w-[200px]">
          Add products from the left to start a new sale
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-[#E9EDF2] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between bg-[#F8F9FB]/50">
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} className="text-[#FF8A00]" />
          <h3 className="font-extrabold text-[#172033] text-[16px]">Cart</h3>
          <span className="bg-[#FF8A00] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>
        <button 
          onClick={onClearCart}
          className="flex items-center gap-1.5 text-[12px] font-bold text-[#F04438] hover:bg-[#FEF3F2] px-3 py-1.5 rounded-lg transition-colors"
        >
          <Trash2 size={14} /> Clear Cart
        </button>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto max-h-[360px] custom-scrollbar p-2">
        <AnimatePresence initial={false}>
          {cart.map(item => (
            <motion.div 
              key={item.productId}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3 border-b border-[#E9EDF2] last:border-0 group"
            >
              {/* Product Thumbnail */}
              <div className="w-14 h-14 bg-[#F8F9FB] rounded-xl flex items-center justify-center text-[#D0D5DD] flex-shrink-0 border border-[#E9EDF2] overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <Package size={24} />
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-extrabold text-[#172033] text-[14px] leading-tight truncate pr-2">
                    {item.productName}
                  </h4>
                  <button 
                    onClick={() => onRemoveFromCart(item.productId)}
                    className="text-[#D0D5DD] hover:text-[#F04438] p-1 -mt-1 -mr-1"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="text-[12px] text-[#667085] mt-0.5 flex items-center gap-2">
                  ₹{item.sellingPrice.toFixed(2)} each
                  {item.stock !== undefined && item.stock <= 5 && item.stock > 0 && (
                    <span className="text-[10px] font-bold text-[#F79009] bg-[#FFFAEB] px-1.5 py-0.5 rounded">
                      Only {item.stock} left
                    </span>
                  )}
                </div>

                {/* Quantity & Price */}
                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center bg-[#F8F9FB] border border-[#E9EDF2] rounded-xl overflow-hidden">
                    <button 
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                      className="w-[44px] h-[36px] flex items-center justify-center text-[#667085] hover:bg-[#E9EDF2] hover:text-[#172033] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} strokeWidth={2.5} />
                    </button>
                    <div className="w-[36px] flex items-center justify-center font-extrabold text-[#172033] text-[14px]">
                      {item.quantity}
                    </div>
                    <button 
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.stock !== undefined && item.quantity >= item.stock}
                      className="w-[44px] h-[36px] flex items-center justify-center text-[#667085] hover:bg-[#E9EDF2] hover:text-[#172033] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="font-black text-[#172033] text-[15px]">
                    ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-t border-[#E9EDF2] bg-[#F8F9FB]/50 flex items-center gap-2">
        <button 
          onClick={onAddNote}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-[#E9EDF2] text-[#667085] text-[13px] font-bold py-2.5 rounded-xl hover:bg-[#F8F9FB] hover:text-[#172033] transition-colors"
        >
          <Plus size={14} /> Add Note
        </button>
      </div>
    </div>
  );
}

// Temporary X icon component since it wasn't imported from lucide-react above
function X(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  );
}

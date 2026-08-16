'use client';

import React, { useState } from 'react';
import { Tag, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BillSummaryProps {
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  itemCount: number;
  onApplyDiscount: (amount: number, type: 'percent' | 'fixed') => void;
}

export function BillSummary({ subtotal, discount, gst, total, itemCount, onApplyDiscount }: BillSummaryProps) {
  const [showDiscountSheet, setShowDiscountSheet] = useState(false);
  const [customDiscount, setCustomDiscount] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customDiscount);
    if (!isNaN(val) && val > 0) {
      onApplyDiscount(val, discountType);
      setShowDiscountSheet(false);
      setCustomDiscount('');
    }
  };

  const handleQuickDiscount = (percent: number) => {
    onApplyDiscount(percent, 'percent');
    setShowDiscountSheet(false);
  };

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-[#E9EDF2] p-5">
      {/* Active Discount Banner */}
      {discount > 0 ? (
        <div className="bg-[#FFFAEB] border border-[#FEF0C7] rounded-2xl p-4 flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#FEF0C7] rounded-full flex items-center justify-center text-[#F79009] flex-shrink-0">
            <Star size={20} fill="currentColor" />
          </div>
          <div className="flex-1">
            <h4 className="font-extrabold text-[#B54708] text-[13px]">You're Saving!</h4>
            <p className="font-black text-[#F79009] text-[20px] leading-tight">₹{discount.toFixed(2)}</p>
          </div>
          <button 
            onClick={() => onApplyDiscount(0, 'fixed')}
            className="text-[#B54708] bg-[#FEF0C7] hover:bg-[#FDB022] hover:text-white px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="mb-5 flex justify-end">
          <button 
            onClick={() => setShowDiscountSheet(true)}
            className="flex items-center gap-1.5 bg-[#ECFDF3] text-[#027A48] border border-[#D1FADF] px-4 py-2 rounded-xl text-[13px] font-bold hover:bg-[#D1FADF] transition-colors"
          >
            <Tag size={14} className="fill-[#12B76A]" /> Apply Discount
          </button>
        </div>
      )}

      {/* Bill Breakup */}
      <div className="space-y-2.5 mb-5 border-b border-[#E9EDF2] pb-5">
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-[#667085] font-medium">Items ({itemCount})</span>
          <span className="text-[#172033] font-bold">₹{subtotal.toFixed(2)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[#667085] font-medium">Discount</span>
            <span className="text-[#16B364] font-bold">-₹{discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-[#667085] font-medium">Sub Total</span>
          <span className="text-[#172033] font-bold">₹{(subtotal - discount).toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-[#667085] font-medium flex items-center gap-1">
            GST <span className="w-4 h-4 rounded-full border border-[#D0D5DD] flex items-center justify-center text-[9px] text-[#D0D5DD]">i</span>
          </span>
          <span className="text-[#172033] font-bold">+₹{gst.toFixed(2)}</span>
        </div>
      </div>

      {/* Total Amount */}
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-extrabold text-[#172033]">Total Amount</span>
        <span className="text-[28px] font-black text-[#FF8A00] tracking-tight">₹{total.toFixed(2)}</span>
      </div>

      {/* Discount Bottom Sheet Modal */}
      <AnimatePresence>
        {showDiscountSheet && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#172033]/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
          >
            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-[400px] shadow-2xl overflow-hidden"
            >
              <div className="p-5 flex items-center justify-between border-b border-[#E9EDF2]">
                <h3 className="font-extrabold text-[#172033] text-[18px]">Apply Discount</h3>
                <button onClick={() => setShowDiscountSheet(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F8F9FB] text-[#667085] hover:bg-[#E9EDF2]">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[5, 10, 15].map(pct => (
                    <button
                      key={pct}
                      onClick={() => handleQuickDiscount(pct)}
                      className="bg-[#FFF0E5] text-[#FF8A00] border border-[#FF8A00]/20 font-extrabold py-3 rounded-[16px] hover:bg-[#FF8A00] hover:text-white transition-colors"
                    >
                      {pct}% OFF
                    </button>
                  ))}
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E9EDF2]"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-[12px] font-bold text-[#667085]">OR CUSTOM</span>
                  </div>
                </div>

                <form onSubmit={handleApplyCustom}>
                  <div className="flex bg-[#F8F9FB] rounded-[16px] p-1 border border-[#E9EDF2] mb-4">
                    <button 
                      type="button"
                      onClick={() => setDiscountType('percent')}
                      className={`flex-1 py-2 text-[13px] font-bold rounded-[12px] transition-colors ${discountType === 'percent' ? 'bg-white shadow-sm text-[#172033]' : 'text-[#667085]'}`}
                    >
                      Percentage (%)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDiscountType('fixed')}
                      className={`flex-1 py-2 text-[13px] font-bold rounded-[12px] transition-colors ${discountType === 'fixed' ? 'bg-white shadow-sm text-[#172033]' : 'text-[#667085]'}`}
                    >
                      Fixed Amount (₹)
                    </button>
                  </div>
                  
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#667085]">
                      {discountType === 'percent' ? '%' : '₹'}
                    </span>
                    <input 
                      type="number" 
                      value={customDiscount}
                      onChange={e => setCustomDiscount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-10 pr-4 py-4 bg-white border border-[#E9EDF2] rounded-[16px] outline-none focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] font-extrabold text-[18px] text-[#172033]"
                      autoFocus
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={!customDiscount}
                    className="w-full mt-6 bg-[#172033] text-white py-4 rounded-[16px] font-extrabold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply Custom Discount
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

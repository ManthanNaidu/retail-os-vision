import React from 'react';
import { motion } from 'framer-motion';
import { PauseCircle, PlayCircle, RotateCcw, Trash2 } from 'lucide-react';

interface BillingToolbarProps {
  onHoldBill?: () => void;
  onResumeBill?: () => void;
  onRepeatSale?: () => void;
  onClearCart?: () => void;
  hasItemsInCart: boolean;
}

export function BillingToolbar({
  onHoldBill,
  onResumeBill,
  onRepeatSale,
  onClearCart,
  hasItemsInCart
}: BillingToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[#E9EDF2] bg-white">
      <div className="flex gap-2">
        <button
          onClick={onResumeBill}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#667085] hover:bg-[#F8F9FB] hover:text-[#172033] transition-colors border border-transparent hover:border-[#E9EDF2]"
        >
          <PlayCircle size={16} /> Resume Bill
        </button>
        <button
          onClick={onRepeatSale}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#667085] hover:bg-[#F8F9FB] hover:text-[#172033] transition-colors border border-transparent hover:border-[#E9EDF2]"
        >
          <RotateCcw size={16} /> Repeat Last Sale
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onHoldBill}
          disabled={!hasItemsInCart}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#F79009] hover:bg-[#FFFAEB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PauseCircle size={16} /> Hold Bill
        </button>
        <button
          onClick={onClearCart}
          disabled={!hasItemsInCart}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#F04438] hover:bg-[#FEF3F2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 size={16} /> Quick Clear
        </button>
      </div>
    </div>
  );
}

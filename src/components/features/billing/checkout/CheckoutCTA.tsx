'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CheckoutCTAProps {
  total: number;
  disabled: boolean;
  onClick: () => void;
}

export function CheckoutCTA({ total, disabled, onClick }: CheckoutCTAProps) {
  return (
    <div className="sticky bottom-4 sm:bottom-6 z-40 mt-4 sm:mt-6 px-4 sm:px-0">
      {disabled ? (
        <div className="w-full bg-[#E9EDF2] text-[#667085] py-4 sm:py-5 rounded-[20px] font-extrabold text-[16px] sm:text-[18px] text-center border border-[#D0D5DD]">
          Add products to start a sale
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClick}
          className="w-full bg-gradient-to-r from-[#FF9800] to-[#FF5A00] text-white py-4 sm:py-5 rounded-[20px] shadow-[0_8px_20px_rgba(255,138,0,0.3)] hover:shadow-[0_12px_30px_rgba(255,138,0,0.4)] transition-all flex items-center justify-center gap-2"
        >
          <span className="font-extrabold text-[18px] sm:text-[20px] tracking-wide">COLLECT</span>
          <span className="font-black text-[18px] sm:text-[20px]">₹{total.toFixed(2)}</span>
        </motion.button>
      )}
    </div>
  );
}

import React from 'react';
import { Crown, ArrowRight, Package, Users, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export interface PlanCardProps {
  plan: string;
  daysRemaining: number;
  productsCount: number;
  customersCount: number;
  salesCount: number;
}

export function PlanCard({ plan, daysRemaining, productsCount, customersCount, salesCount }: PlanCardProps) {
  return (
    <div className="bg-white border border-[#14233c]/5 rounded-[18px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative overflow-hidden">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
          <Crown className="w-5 h-5 text-[#FF8A00]" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <div className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider mb-0.5">Your Plan</div>
          <h3 className="text-[18px] font-bold text-[#172033] leading-tight">{plan}</h3>
          <p className="text-[13px] font-semibold text-[#FF8A00] mt-0.5">{daysRemaining} days remaining</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-5 px-2">
        <div className="text-center">
          <div className="text-[11px] font-medium text-[#667085] mb-1">Products</div>
          <div className="text-[13px] font-bold text-[#172033]">{productsCount} <span className="text-[#98A2B3] font-medium">/ 500</span></div>
        </div>
        <div className="text-center">
          <div className="text-[11px] font-medium text-[#667085] mb-1">Customers</div>
          <div className="text-[13px] font-bold text-[#172033]">{customersCount} <span className="text-[#98A2B3] font-medium">/ 1000</span></div>
        </div>
        <div className="text-center">
          <div className="text-[11px] font-medium text-[#667085] mb-1">Invoices</div>
          <div className="text-[13px] font-bold text-[#172033]">{salesCount} <span className="text-[#98A2B3] font-medium">/ 1000</span></div>
        </div>
      </div>
      
      <motion.button 
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-[#FF8A00] to-[#FF5A00] text-white font-bold text-[14px] py-3.5 rounded-[14px] flex items-center justify-center gap-2 shadow-sm"
      >
        Upgrade to Pro <ArrowRight className="w-4 h-4 ml-1" />
      </motion.button>
    </div>
  );
}

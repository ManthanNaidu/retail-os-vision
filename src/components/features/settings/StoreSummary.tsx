import React from 'react';
import { Package, Users, IndianRupee } from 'lucide-react';

export interface StoreSummaryProps {
  productsCount: number;
  customersCount: number;
  salesTotal: number;
}

export function StoreSummary({ productsCount, customersCount, salesTotal }: StoreSummaryProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar -mx-4 px-4 mb-7">
      <div className="bg-white border border-[#14233c]/5 rounded-[18px] p-4 min-w-[130px] flex-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[100px]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#F3F0FF] flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-[#6941C6]" />
          </div>
          <span className="text-[12px] font-semibold text-[#172033]">Products</span>
        </div>
        <div>
          <div className="text-[20px] font-bold text-[#172033] leading-none mb-1">{productsCount}</div>
          <div className="text-[10px] font-medium text-[#667085]">Items in stock</div>
        </div>
      </div>

      <div className="bg-white border border-[#14233c]/5 rounded-[18px] p-4 min-w-[130px] flex-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[100px]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#E0F2FE] flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-[#0284C7]" />
          </div>
          <span className="text-[12px] font-semibold text-[#172033]">Customers</span>
        </div>
        <div>
          <div className="text-[20px] font-bold text-[#172033] leading-none mb-1">{customersCount}</div>
          <div className="text-[10px] font-medium text-[#667085]">Total customers</div>
        </div>
      </div>

      <div className="bg-white border border-[#14233c]/5 rounded-[18px] p-4 min-w-[140px] flex-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[100px]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#ECFDF3] flex items-center justify-center shrink-0">
            <IndianRupee className="w-4 h-4 text-[#027A48]" />
          </div>
          <span className="text-[12px] font-semibold text-[#172033]">Sales</span>
        </div>
        <div>
          <div className="text-[20px] font-bold text-[#172033] leading-none mb-1">₹{salesTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-[10px] font-medium text-[#667085]">Total sales</div>
        </div>
      </div>
    </div>
  );
}

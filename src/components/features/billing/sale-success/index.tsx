'use client';

import { motion } from 'framer-motion';
import { X, Check, Package, MessageCircle, Share2, Printer, ArrowRight, Store } from 'lucide-react';
import { Sale } from '@/types';

// 1. Success Hero
export function SuccessHero({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  return (
    <div className="relative pt-10 pb-6 flex flex-col items-center justify-center text-center">
      <button
        onClick={onClose}
        className="absolute top-2 -right-4 sm:right-0 text-[#667085] hover:text-[#111827] bg-[#F9FAFB] hover:bg-[#F3F4F6] rounded-full p-2 transition-colors z-20"
        aria-label="Close"
      >
        <X size={20} />
      </button>
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-16 h-16 bg-[#ECFDF3] text-[#12B76A] rounded-full flex items-center justify-center mb-4 border-4 border-[#D1FADF]"
      >
        <Check size={32} strokeWidth={3} />
      </motion.div>
      
      <h2 className="text-[#111827] text-[24px] font-bold tracking-tight mb-1">
        Sale Completed
      </h2>
      <p className="text-[#667085] text-[14px] font-medium">
        Invoice #{sale.invoiceNumber}
      </p>
    </div>
  );
}

// 2. Store Summary
export function StoreSummary({ storeName, storeAddress, storeGst }: { storeName: string, storeAddress: string, storeGst?: string }) {
  return (
    <div className="flex items-center gap-4 py-4 border-y border-[#E5E7EB] mb-6 mt-2">
      <div className="w-12 h-12 bg-[#F3F4F6] text-[#4B5563] rounded-full flex items-center justify-center flex-shrink-0">
        <Store size={24} strokeWidth={1.5} />
      </div>
      <div className="flex-1 overflow-hidden">
        <h3 className="font-bold text-[#111827] text-[15px] truncate">{storeName}</h3>
        <p className="text-[13px] text-[#667085] truncate">{storeAddress}</p>
      </div>
      <div className="text-right">
        <p className="text-[11px] text-[#667085] uppercase tracking-wider font-semibold mb-0.5">GSTIN</p>
        <p className="text-[13px] font-medium text-[#111827]">{storeGst || '29ABCDE1234F1Z5'}</p>
      </div>
    </div>
  );
}

// 3. Invoice Items
export function InvoiceItems({ items }: { items: any[] }) {
  return (
    <div className="mb-6">
      <h4 className="text-[12px] font-bold text-[#667085] uppercase tracking-wider mb-3">Order Summary</h4>
      <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
        {items.map((item, i) => (
          <div className="flex items-start justify-between" key={i}>
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
              <div className="w-10 h-10 bg-[#F9FAFB] rounded-md flex items-center justify-center text-[#9CA3AF] border border-[#E5E7EB] flex-shrink-0 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.productName} className="w-full h-full object-cover rounded-md" />
                ) : (
                  <Package size={20} strokeWidth={1.5} />
                )}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-[14px] font-semibold text-[#111827] truncate">{item.productName}</p>
                <p className="text-[13px] text-[#667085]">Qty: {item.quantity} × ₹{item.sellingPrice.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-[14px] font-bold text-[#111827]">₹{item.total.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Payment Summary
export function PaymentSummary({ sale }: { sale: Sale }) {
  return (
    <div className="mb-6 bg-[#F9FAFB] rounded-2xl p-5 border border-[#E5E7EB]">
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-[14px] text-[#4B5563]">
          <span>Subtotal</span><span>₹{sale.subtotal.toFixed(2)}</span>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between text-[14px] text-[#16B364]">
            <span>Discount</span><span>-₹{sale.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-[14px] text-[#4B5563]">
          <span>GST</span><span>₹{sale.gstAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-[#E5E7EB] mb-4">
        <span className="font-bold text-[#111827] text-[16px]">Total Paid</span>
        <span className="font-bold text-[#111827] text-[24px]">₹{sale.total.toFixed(2)}</span>
      </div>
      
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-[#667085] flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
          Paid via {sale.paymentMethod}
        </span>
      </div>
    </div>
  );
}

// 5. Receipt Actions
export function ReceiptActions({ onWhatsApp, onPDF, onPrint }: { onWhatsApp: () => void, onPDF: () => void, onPrint: () => void }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={onWhatsApp} 
        className="flex flex-col items-center justify-center gap-2 p-3 text-[#12B76A] hover:bg-[#F0FDF4] rounded-xl transition-colors min-w-[80px]"
      >
        <MessageCircle size={22} strokeWidth={1.5} />
        <span className="text-[12px] font-semibold">WhatsApp</span>
      </motion.button>
      
      <div className="w-[1px] h-8 bg-[#E5E7EB]"></div>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={onPDF} 
        className="flex flex-col items-center justify-center gap-2 p-3 text-[#6366F1] hover:bg-[#EEF2FF] rounded-xl transition-colors min-w-[80px]"
      >
        <Share2 size={22} strokeWidth={1.5} />
        <span className="text-[12px] font-semibold">Share</span>
      </motion.button>

      <div className="w-[1px] h-8 bg-[#E5E7EB]"></div>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={onPrint} 
        className="flex flex-col items-center justify-center gap-2 p-3 text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl transition-colors min-w-[80px]"
      >
        <Printer size={22} strokeWidth={1.5} />
        <span className="text-[12px] font-semibold">Print</span>
      </motion.button>
    </div>
  );
}

// 6. New Sale Button
export function NewSaleButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick} 
      className="w-full flex items-center justify-center gap-2 bg-[#111827] hover:bg-[#374151] text-white rounded-xl py-3.5 shadow-md transition-colors"
    >
      <span className="text-[16px] font-bold">Start New Sale</span>
      <ArrowRight size={20} className="text-white" />
    </motion.button>
  );
}

// -- MAIN COMPONENT --
interface SaleSuccessModalProps {
  sale: Sale;
  onClose: () => void;
  onNewSale: () => void;
  onWhatsApp: () => void;
  onPDF: () => void;
  onPrint: () => void;
  storeName: string;
  storeAddress: string;
  totalSalesToday: number;
}

export default function SaleSuccessModal({
  sale, onClose, onNewSale, onWhatsApp, onPDF, onPrint, storeName, storeAddress, totalSalesToday
}: SaleSuccessModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#111827]/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="bg-white rounded-t-[32px] sm:rounded-[24px] w-full max-w-[420px] shadow-2xl relative flex flex-col max-h-[96vh] mx-auto overflow-hidden"
      >
        <div className="overflow-y-auto custom-scrollbar flex-1 px-8 pb-8 pt-2">
          <SuccessHero sale={sale} onClose={onClose} />
          
          <div className="px-1">
            <StoreSummary storeName={storeName} storeAddress={storeAddress} />
            <InvoiceItems items={sale.items} />
            <PaymentSummary sale={sale} />
            <ReceiptActions onWhatsApp={onWhatsApp} onPDF={onPDF} onPrint={onPrint} />
            
            <div className="mt-4">
              <NewSaleButton onClick={onNewSale} />
            </div>
            
            {totalSalesToday > 0 && (
              <p className="text-center text-[12px] text-[#667085] mt-6 font-medium">
                You've made {totalSalesToday} sales today. Keep it up!
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

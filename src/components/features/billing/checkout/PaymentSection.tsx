'use client';

import React, { useState } from 'react';
import { Banknote, CreditCard, Wallet, QrCode, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type PaymentMethodType = 'cash' | 'upi' | 'card' | 'credit';

interface PaymentSectionProps {
  total: number;
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
  amountReceived: number;
  onAmountReceivedChange: (amount: number) => void;
  onConfirmUpiPayment: () => void;
}

export function PaymentSection({
  total,
  selectedMethod,
  onSelectMethod,
  amountReceived,
  onAmountReceivedChange,
  onConfirmUpiPayment
}: PaymentSectionProps) {
  const [showUpiModal, setShowUpiModal] = useState(false);

  const methods = [
    { id: 'cash', label: 'Cash', icon: <Banknote size={24} /> },
    { id: 'upi', label: 'UPI', icon: <QrCode size={24} /> },
    { id: 'card', label: 'Card', icon: <CreditCard size={24} /> },
    { id: 'credit', label: 'Credit', icon: <Wallet size={24} /> },
  ] as const;

  const handleUpiSelect = () => {
    onSelectMethod('upi');
    setShowUpiModal(true);
  };

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-[#E9EDF2] p-5">
      <div className="grid grid-cols-4 gap-2 mb-4">
        {methods.map(method => (
          <button
            key={method.id}
            onClick={() => method.id === 'upi' ? handleUpiSelect() : onSelectMethod(method.id as PaymentMethodType)}
            className={`flex flex-col items-center justify-center p-3 rounded-[16px] border-2 transition-all relative overflow-hidden ${
              selectedMethod === method.id 
                ? 'border-[#FF8A00] bg-[#FFF0E5] text-[#FF8A00]' 
                : 'border-[#E9EDF2] bg-[#F8F9FB] text-[#667085] hover:border-[#D0D5DD] hover:bg-[#F0F2F5]'
            }`}
          >
            {method.icon}
            <span className={`text-[11px] font-extrabold mt-1.5 ${selectedMethod === method.id ? 'text-[#FF8A00]' : 'text-[#667085]'}`}>
              {method.label}
            </span>
            {selectedMethod === method.id && (
              <div className="absolute top-1 right-1">
                <div className="bg-[#FF8A00] text-white rounded-full p-0.5">
                  <Check size={10} strokeWidth={4} />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Cash Flow */}
      {selectedMethod === 'cash' && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-[#E9EDF2] pt-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#667085]">Quick Amounts</span>
          </div>
          <div className="flex overflow-x-auto gap-2 pb-3 hide-scrollbar">
            {[50, 100, 200, 500, total].map((amt, i) => (
              <button
                key={i}
                onClick={() => onAmountReceivedChange(Math.max(amt, total))}
                className="px-4 py-2.5 rounded-[12px] border border-[#E9EDF2] bg-white text-[#172033] text-[13px] font-bold whitespace-nowrap hover:bg-[#F8F9FB] hover:border-[#D0D5DD]"
              >
                ₹{Math.max(amt, total).toFixed(2)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#F8F9FB] border border-[#E9EDF2] rounded-[12px] px-3 py-2 flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#667085]">Received</span>
              <input 
                type="number"
                value={amountReceived || ''}
                onChange={e => onAmountReceivedChange(parseFloat(e.target.value))}
                className="bg-transparent outline-none w-24 text-right font-extrabold text-[15px] text-[#172033]"
                placeholder={total.toString()}
              />
            </div>
            <div className="flex-1 bg-[#ECFDF3] border border-[#D1FADF] rounded-[12px] px-3 py-2 flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#027A48]">Change</span>
              <span className="font-extrabold text-[15px] text-[#027A48]">
                ₹{Math.max(0, amountReceived - total).toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* UPI Bottom Sheet Modal */}
      <AnimatePresence>
        {showUpiModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#172033]/80 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-[400px] shadow-2xl relative"
            >
              <div className="p-6 text-center border-b border-[#E9EDF2]">
                <h3 className="font-extrabold text-[#172033] text-[20px] mb-1">UPI Payment</h3>
                <p className="text-[14px] text-[#667085]">Ask customer to scan and pay</p>
                <div className="mt-4 text-[36px] font-black text-[#172033] tracking-tight">
                  ₹{total.toFixed(2)}
                </div>
              </div>

              <div className="p-8 flex flex-col items-center">
                <div className="w-[200px] h-[200px] bg-[#F8F9FB] border border-[#E9EDF2] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  {/* Mock QR Code */}
                  <div 
                    className="w-[180px] h-[180px] bg-contain bg-center bg-no-repeat opacity-80 mix-blend-multiply"
                    style={{ backgroundImage: `url('https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=retailos@ybl&pn=RetailOS&am=${total}')` }}
                  ></div>
                </div>
                
                <div className="flex items-center gap-2 text-[#F79009] font-bold text-[14px] bg-[#FFFAEB] px-4 py-2 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#F79009] animate-pulse"></span>
                  Waiting for payment...
                </div>
              </div>

              <div className="p-4 grid grid-cols-2 gap-3 border-t border-[#E9EDF2] bg-[#F8F9FB] rounded-b-[32px]">
                <button 
                  onClick={() => setShowUpiModal(false)}
                  className="bg-white border border-[#E9EDF2] text-[#172033] font-extrabold py-4 rounded-[16px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowUpiModal(false);
                    onConfirmUpiPayment();
                  }}
                  className="bg-[#16B364] text-white font-extrabold py-4 rounded-[16px] shadow-[0_4px_12px_rgba(22,179,100,0.2)]"
                >
                  Received
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

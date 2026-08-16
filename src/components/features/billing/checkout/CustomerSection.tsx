'use client';

import React, { useState, useMemo } from 'react';
import { Customer } from '@/types';
import { Search, Plus, User, X, Phone, MessageCircle, ChevronRight, Star, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';

interface CustomerSectionProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  isWalkIn: boolean;
  onSetWalkIn: (isWalkIn: boolean) => void;
}

export function CustomerSection({
  selectedCustomer,
  onSelectCustomer,
  isWalkIn,
  onSetWalkIn
}: CustomerSectionProps) {
  const { customers } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Recent' | 'Favorites' | 'Walk-in'>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    let filtered = [...customers];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.phone.includes(q)
      );
    } else {
      if (activeTab === 'Recent') {
        // Mock recent sort
        filtered = filtered.slice(0, 5);
      } else if (activeTab === 'Favorites') {
        filtered = filtered.filter(c => c.segment === 'VIP'); // Using VIP as proxy for favorites
      }
    }
    
    return filtered;
  }, [customers, searchQuery, activeTab]);

  // Handle Walk In Selection
  const handleWalkIn = () => {
    onSelectCustomer(null);
    onSetWalkIn(true);
  };

  // Add Customer State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newWhatsApp, setNewWhatsApp] = useState('');

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    
    const newCustomer: Customer = {
      id: `C${Date.now()}`,
      name: newName,
      phone: newPhone,
      email: '',
      creditBalance: 0,
      loyaltyPoints: 0,
      totalPurchases: 0,
      segment: 'New',
      createdAt: new Date().toISOString(),
    };
    
    // In a real app we would dispatch to store, but here we just mock selection for UI demo
    // useAppStore.getState().addCustomer(newCustomer);
    
    onSelectCustomer(newCustomer);
    onSetWalkIn(false);
    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
  };

  if (selectedCustomer || isWalkIn) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[16px] shadow-sm border border-[#E9EDF2] p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFF0E5] text-[#FF8A00] flex items-center justify-center font-bold text-lg">
            {isWalkIn ? <User size={20} /> : selectedCustomer?.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-extrabold text-[#172033] text-[15px] leading-tight">
              {isWalkIn ? 'Walk-in Customer' : selectedCustomer?.name}
            </h3>
            {!isWalkIn && (
              <p className="text-[12px] text-[#667085] mt-0.5">
                {selectedCustomer?.phone} • <span className="text-[#16B364] font-medium">● Active</span>
              </p>
            )}
            {isWalkIn && <p className="text-[12px] text-[#667085] mt-0.5">No saved details</p>}
          </div>
        </div>
        <button 
          onClick={() => { onSelectCustomer(null); onSetWalkIn(false); }}
          className="text-[12px] font-bold text-[#FF8A00] bg-[#FFF0E5] px-3 py-1.5 rounded-lg"
        >
          Change
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-[#E9EDF2] overflow-hidden flex flex-col flex-shrink-0 h-[400px] md:h-auto">
      {/* Header */}
      <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between flex-shrink-0 bg-white z-10">
        <div className="flex items-center gap-2 text-[#172033] font-extrabold">
          <User size={18} className="text-[#FF8A00]" />
          Customer
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="text-[#FF8A00] text-[13px] font-bold flex items-center gap-1 hover:bg-[#FFF0E5] px-2 py-1 rounded-lg transition-colors"
        >
          <Plus size={16} /> Customer
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-[#E9EDF2] flex-shrink-0 bg-white z-10">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
          <input 
            type="text" 
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', paddingRight: '40px' }}
            className="w-full py-3 bg-[#F8F9FB] border-none rounded-[12px] text-[14px] outline-none focus:ring-2 focus:ring-[#FF8A00]/20 font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#172033]"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 p-3 border-b border-[#E9EDF2] hide-scrollbar flex-shrink-0 bg-white z-10">
        {['All', 'Recent', 'Favorites', 'Walk-in'].map(tab => (
          <button
            key={tab}
            onClick={() => tab === 'Walk-in' ? handleWalkIn() : setActiveTab(tab as any)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${
              activeTab === tab && tab !== 'Walk-in'
                ? 'bg-[#FF8A00] text-white shadow-sm'
                : 'bg-[#F8F9FB] text-[#667085] hover:bg-[#E9EDF2]'
            }`}
          >
            {tab} {tab === 'Favorites' && '★'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Walk-in fixed row if searching or all */}
        {(!searchQuery && activeTab === 'All') && (
          <div 
            onClick={handleWalkIn}
            className="flex items-center gap-3 p-3 mb-1 rounded-[16px] hover:bg-[#F8F9FB] cursor-pointer transition-colors border border-transparent hover:border-[#E9EDF2]"
          >
            <div className="w-12 h-12 rounded-full bg-[#F0F2F5] text-[#667085] flex items-center justify-center flex-shrink-0">
              <User size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-[#172033] text-[14px]">Walk-in Customer</h4>
              <p className="text-[12px] text-[#667085]">No saved details</p>
            </div>
            <div className="text-[11px] font-bold text-[#FF8A00] bg-[#FFF0E5] px-3 py-1 rounded-full">
              Walk-in
            </div>
          </div>
        )}

        {filteredCustomers.map(c => (
          <div 
            key={c.id}
            onClick={() => onSelectCustomer(c)}
            className="flex items-center gap-3 p-3 mb-1 rounded-[16px] hover:bg-[#FFF0E5]/50 cursor-pointer transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-[#F8F9FB] text-[#172033] font-bold flex items-center justify-center flex-shrink-0 border border-[#E9EDF2] group-hover:border-[#FF8A00]/30 group-hover:bg-white">
              {c.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-[#172033] text-[14px] truncate">{c.name}</h4>
                {c.segment === 'VIP' && <Star size={12} className="text-[#F79009] fill-[#F79009]" />}
              </div>
              <p className="text-[12px] text-[#667085] flex items-center gap-2 mt-0.5">
                {c.phone}
                <span className="flex items-center gap-1 text-[10px] text-[#16B364] font-medium bg-[#ECFDF3] px-1.5 rounded-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16B364]"></span> Active
                </span>
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-full hover:bg-[#F8F9FB] flex items-center justify-center text-[#667085]" onClick={e => e.stopPropagation()}>
                <Phone size={14} />
              </button>
              <button className="w-8 h-8 rounded-full hover:bg-[#DCFCE7] flex items-center justify-center text-[#16B364]" onClick={e => e.stopPropagation()}>
                <MessageCircle size={14} />
              </button>
              <ChevronRight size={16} className="text-[#D0D5DD] ml-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white z-10 flex flex-col"
          >
            <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
              <h3 className="font-extrabold text-[#172033]">Add New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-[#F8F9FB] rounded-full text-[#667085]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto">
              <div>
                <label className="text-[12px] font-bold text-[#667085] mb-1.5 block">Full Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full p-3.5 bg-[#F8F9FB] border border-[#E9EDF2] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00]"
                  placeholder="e.g. Nishi"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#667085] mb-1.5 block">Phone Number</label>
                <input 
                  type="tel" 
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full p-3.5 bg-[#F8F9FB] border border-[#E9EDF2] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00]"
                  placeholder="10-digit number"
                  required
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#667085] mb-1.5 block">WhatsApp Number (Optional)</label>
                <input 
                  type="tel" 
                  value={newWhatsApp}
                  onChange={e => setNewWhatsApp(e.target.value)}
                  className="w-full p-3.5 bg-[#F8F9FB] border border-[#E9EDF2] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00]"
                  placeholder="Same as phone"
                />
              </div>
              
              <div className="mt-auto pt-6">
                <button 
                  type="submit"
                  disabled={!newName || !newPhone}
                  className="w-full bg-[#FF8A00] text-white py-4 rounded-[16px] font-extrabold text-[15px] hover:bg-[#E67A00] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(255,138,0,0.2)]"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

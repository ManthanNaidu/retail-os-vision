'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import {  Zap, Check, Store, Phone, MapPin, Eye, EyeOff, ChevronRight, ArrowRight, Shield, Map , Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getStoreTypeList, StoreType } from '@/lib/storeTypes';
import { registerStore } from '@/lib/licenseManager';

export default function SetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [storeTypes, setStoreTypes] = useState<StoreType[]>([]);
  
  const [selectedType, setSelectedType] = useState<StoreType | null>(null);
  
  const [storeDetails, setStoreDetails] = useState({
    storeName: '',
    ownerName: '',
    phone: '',
    whatsapp: '',
    email: '',
    city: '',
    address: '',
    gstNumber: '',
    upiId: ''
  });
  
  const [sameAsPhone, setSameAsPhone] = useState(false);
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStoreDetails(prev => {
      const next = { ...prev, phone: value };
      if (sameAsPhone) next.whatsapp = value;
      return next;
    });
  };

  const handleSameAsPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSameAsPhone(checked);
    if (checked) {
      setStoreDetails(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  };

  useEffect(() => {
    try {
      const types = getStoreTypeList();
      setStoreTypes(types);
    } catch (error) {
      console.error("Failed to load store types", error);
    }

    if (user) {
      setStoreDetails(prev => ({ 
        ...prev, 
        email: user.email || '',
        ownerName: user.displayName || ''
      }));
    }
  }, [user]);
  
  const handleNext = () => {
    if (step === 1 && !selectedType) return;
    if (step === 2 && (!storeDetails.storeName || !storeDetails.ownerName || !storeDetails.phone || !storeDetails.whatsapp)) return;
    setStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setStep(prev => prev - 1);
  };
  
  const handleComplete = async () => {
    setLoading(true);
    try {
      if (!user) throw new Error("No authenticated user");

      const profile = {
        uid: user.uid,
        storeType: selectedType?.id,
        storeName: storeDetails.storeName,
        ownerName: storeDetails.ownerName,
        phone: storeDetails.phone,
        whatsapp: storeDetails.whatsapp,
        email: storeDetails.email,
        city: storeDetails.city,
        address: storeDetails.address,
        gstNumber: storeDetails.gstNumber,
        upiId: storeDetails.upiId,
        role: 'owner',
        setupComplete: true,
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('retailos_profile', JSON.stringify(profile));
      await registerStore(storeDetails.email, storeDetails.ownerName, storeDetails.storeName, storeDetails.city);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStep(4);
    } catch (error) {
      console.error('Setup failed', error);
      setLoading(false);
    }
  };
  
  const finishSetup = () => {
    router.push('/dashboard');
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full"
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">What do you sell?</h1>
              <p className="text-slate-500 text-sm font-medium">Choose your store type to customize RetailOS for your business.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 flex-1 custom-scrollbar pb-32">
              {storeTypes.map(type => {
                const IconComp = (LucideIcons as any)[type.iconName] || LucideIcons.Store;
                const isSelected = selectedType?.id === type.id;
                
                return (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(type)}
                    className={`p-4 rounded-[2rem] border-2 text-center flex flex-col items-center justify-center transition-all min-h-[160px] ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/10' 
                        : 'border-amber-100 bg-[#fffdf8] hover:border-orange-300 hover:bg-amber-50 shadow-sm'
                    }`}
                  >
                    <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center mb-4 transition-all duration-300 overflow-hidden ${
                      isSelected ? 'bg-orange-500 text-white ring-4 ring-orange-500/20 scale-105 shadow-md' : 'bg-amber-50 text-orange-600'
                    }`}>
                      {type.image ? (
                        <img src={type.image} alt={type.name} className="w-full h-full object-cover scale-[1.15]" />
                      ) : (
                        <IconComp size={48} strokeWidth={2.5} />
                      )}
                    </div>
                    <span className={`font-extrabold text-[15px] leading-tight ${isSelected ? 'text-orange-700' : 'text-slate-700'}`}>
                      {type.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            
            <div className="fixed bottom-0 left-0 w-full bg-white z-50 p-4 border-t border-amber-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <button
                onClick={handleNext}
                disabled={!selectedType}
                className={`w-full py-6 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center transition-all text-xl ${
                  selectedType 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-orange-500/25 active:scale-[0.98]' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                Continue <ArrowRight className="ml-2 w-6 h-6" />
              </button>
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full absolute inset-0 pb-[88px]"
          >
            <div className="overflow-y-auto px-6 pt-2 pb-6 flex-1 custom-scrollbar w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-black text-slate-900 mb-1 tracking-tight leading-tight">Let's set up<br/>your store <Sparkles className="inline w-6 h-6 text-amber-400" /></h1>
                  <p className="text-slate-500 text-[13px] font-medium mt-1">Tell us a little about your business.</p>
                </div>
                <div className="w-28 h-28 shrink-0 -mr-2 relative">
                   <img src="/images/my_store.png" alt="Store setup" className="w-full h-full object-contain drop-shadow-sm" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">Basic Information</h3>
                
                <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Store Name <span className="text-orange-500">*</span></label>
                    <input type="text" value={storeDetails.storeName} onChange={e => setStoreDetails({...storeDetails, storeName: e.target.value})} placeholder="e.g. Shree Ram Stores" className="w-full bg-transparent border-none outline-none text-slate-800 font-bold text-[14px] p-0 placeholder:text-slate-300" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <LucideIcons.User className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Owner Name <span className="text-orange-500">*</span></label>
                    <input type="text" value={storeDetails.ownerName} onChange={e => setStoreDetails({...storeDetails, ownerName: e.target.value})} placeholder="e.g. Rajesh Kumar" className="w-full bg-transparent border-none outline-none text-slate-800 font-bold text-[14px] p-0 placeholder:text-slate-300" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Phone <span className="text-orange-500">*</span></label>
                      <input type="tel" value={storeDetails.phone} onChange={handlePhoneChange} placeholder="9876543210" maxLength={10} className="w-full bg-transparent border-none outline-none text-slate-800 font-bold text-[14px] p-0 placeholder:text-slate-300" />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-center gap-3 relative">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      <LucideIcons.MessageCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <label className="block text-[11px] font-bold text-slate-500 mb-0.5">WhatsApp</label>
                      <input type="tel" value={storeDetails.whatsapp} onChange={e => setStoreDetails({...storeDetails, whatsapp: e.target.value})} disabled={sameAsPhone} placeholder="9876543210" maxLength={10} className={`w-full bg-transparent border-none outline-none text-slate-800 font-bold text-[14px] p-0 placeholder:text-slate-300 ${sameAsPhone ? 'opacity-50' : ''}`} />
                    </div>
                    <label className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium absolute top-4 right-4 cursor-pointer">
                      <input type="checkbox" checked={sameAsPhone} onChange={handleSameAsPhoneChange} className="rounded-sm border-slate-300 text-orange-500 focus:ring-orange-500 w-3 h-3" />
                      Same
                    </label>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">City <span className="text-orange-500">*</span></label>
                    <input type="text" value={storeDetails.city} onChange={e => setStoreDetails({...storeDetails, city: e.target.value})} placeholder="e.g. Bengaluru, Karnataka" className="w-full bg-transparent border-none outline-none text-slate-800 font-bold text-[14px] p-0 placeholder:text-slate-300" />
                  </div>
                  <LucideIcons.ChevronDown className="w-5 h-5 text-slate-400" />
                </div>

                <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-center justify-between mt-2 cursor-pointer">
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900">More business details <span className="text-slate-400 font-medium text-[13px]">(Optional)</span></h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">GST, UPI ID, Full Address, Pincode...</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
                
                {/* Your Store Preview */}
                <div className="bg-[#FFF8F3] border border-orange-100 rounded-[24px] p-5 mt-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[14px] font-bold text-slate-800">Your Store Preview</h4>
                    <span className="text-green-600 text-[10px] font-bold tracking-wider uppercase">LIVE</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 p-1">
                      {selectedType?.image ? (
                         <img src={selectedType.image} alt="Store type" className="w-full h-full object-cover scale-110" />
                       ) : (
                         <Store className="w-8 h-8 text-slate-400" />
                       )}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-[16px] font-black text-slate-900 leading-tight">{storeDetails.storeName || 'Shree Ram Stores'}</h3>
                      <p className="text-slate-500 font-semibold text-[13px] mt-0.5">{selectedType?.name || 'Grocery / Kirana'}</p>
                      <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium mt-1">
                        <MapPin className="w-3 h-3" /> {storeDetails.city || 'Bengaluru, Karnataka'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: LucideIcons.Receipt, label: 'Billing', bg: 'bg-[#F3E8FF]', color: 'text-[#9333EA]' },
                      { icon: LucideIcons.Package, label: 'Inventory', bg: 'bg-[#FFEDD5]', color: 'text-[#EA580C]' },
                      { icon: LucideIcons.Users, label: 'Customers', bg: 'bg-[#E0F2FE]', color: 'text-[#0284C7]' },
                      { icon: Sparkles, label: 'AI Assistant', bg: 'bg-[#FDF4FF]', color: 'text-[#C026D3]' },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center`}>
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-slate-100 z-50">
              <button
                onClick={handleComplete}
                disabled={loading || !storeDetails.storeName || !storeDetails.ownerName || !storeDetails.phone}
                className={`w-full py-4 rounded-full font-bold text-white flex items-center justify-center transition-all text-[16px] active:scale-[0.98] ${
                  storeDetails.storeName && storeDetails.ownerName && storeDetails.phone && !loading
                    ? 'bg-[#FF6B00] shadow-lg shadow-orange-500/20' 
                    : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                }`}
              >
                {loading ? 'Saving...' : 'Continue'} {!loading && <ArrowRight className="ml-2 w-5 h-5 opacity-70" />}
              </button>
              <div className="text-center mt-3 flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-medium pb-2">
                <LucideIcons.Lock className="w-3 h-3" /> Your data is safe and secure
              </div>
            </div>
          </motion.div>
        );
        
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-full absolute inset-0 pb-[120px]"
          >
            {/* Top Graphics */}
            <div className="absolute -top-10 -left-8 -right-8 h-48 bg-[#FFF8F3] -z-10 rounded-t-[2rem]"></div>

            <div className="overflow-y-auto px-6 pt-2 pb-6 flex-1 custom-scrollbar w-full">
              <div className="flex flex-col items-center mt-8 mb-6 relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-[2rem]">
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-2xl"
                      initial={{ top: -50, left: `${Math.random() * 100}%`, rotate: 0, opacity: 1 }}
                      animate={{ top: '120%', rotate: 360, opacity: 0 }}
                      transition={{ duration: 4 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}
                    >
                      {['🌸', '🌼', '🏵️', '🌺', '🌻', '🌷', '🌹'][Math.floor(Math.random() * 7)]}
                    </motion.div>
                  ))}
                </div>
                <div className="w-24 h-24 bg-[#10B981] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-4 z-10 relative">
                   <Check className="w-12 h-12 text-white" strokeWidth={4} />
                </div>
                <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight z-10 relative">Welcome Onboard!</h1>
                <p className="text-[14px] font-bold mt-1 text-slate-600 z-10 relative"><span className="text-[#FF6B00]">Shubh Aarambh!</span> Your store is ready.</p>
              </div>
              
              <div className="bg-[#FFF8F3] border border-orange-100 rounded-[20px] p-4 w-full mb-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0 border border-orange-50 p-1">
                   {selectedType?.image ? (
                     <img src={selectedType?.image} alt="Store type" className="w-full h-full object-cover scale-110" />
                   ) : (
                     <Store size={32} className="text-slate-400" strokeWidth={1.5} />
                   )}
                </div>
                <div className="flex flex-col items-start text-left flex-1">
                  <h2 className="text-[16px] font-black text-slate-900 mb-0.5 leading-tight">{storeDetails.storeName || 'Shree Ram Stores'}</h2>
                  <div className="flex items-center gap-1.5 text-[12px] text-slate-500 font-semibold mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {selectedType?.name || 'Grocery / Kirana'}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <MapPin className="w-3 h-3" /> {storeDetails.city || 'Bengaluru, Karnataka'}
                  </div>
                </div>
              </div>
              
              <h3 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2 px-1">Your Store is Ready</h3>
              
              <div className="bg-white border border-slate-100 rounded-3xl py-2 px-1 mb-6">
                {[
                  { icon: Store, title: 'Store Profile', subtitle: 'Completed', color: 'text-[#FF6B00]', bg: 'bg-orange-50' },
                  { icon: LucideIcons.Receipt, title: 'Billing & Invoicing', subtitle: 'Ready to use', color: 'text-[#9333EA]', bg: 'bg-[#F3E8FF]' },
                  { icon: LucideIcons.Package, title: 'Inventory Management', subtitle: 'Configured', color: 'text-[#EA580C]', bg: 'bg-[#FFEDD5]' },
                  { icon: LucideIcons.Users, title: 'Customers & Credit', subtitle: 'Enabled', color: 'text-[#0284C7]', bg: 'bg-[#E0F2FE]' },
                  { icon: LucideIcons.Bot, title: 'RetailBot AI Assistant', subtitle: 'Active & Ready', color: 'text-[#7C3AED]', bg: 'bg-[#F3E8FF]' }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 ${i !== 4 ? 'border-b border-slate-50' : ''}`}>
                    <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[13px] font-bold text-slate-800 leading-tight">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{item.subtitle}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-green-500" strokeWidth={3} />
                    </div>
                  </div>
                ))}
              </div>

              {/* RetailBot Promo */}
              <div className="bg-[#F8F5FF] border border-[#E9D5FF] rounded-[20px] p-4 flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-[#E9D5FF] flex items-center justify-center overflow-hidden shrink-0">
                  <img src="/images/retailbot.jpg" alt="RetailBot" className="w-full h-full object-cover mix-blend-multiply" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-bold text-[#7C3AED] leading-tight flex items-center gap-1 mb-1">RetailBot is here to help you <Sparkles className="w-3.5 h-3.5" /></h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 mb-2 leading-tight">I've set up everything for your store. What would you like to do next?</p>
                  <button className="text-[#7C3AED] text-[11px] font-bold flex items-center gap-1">
                    Ask RetailBot <Sparkles className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 px-6 z-50">
              <button
                onClick={finishSetup}
                className="w-full py-3.5 rounded-full font-bold text-white bg-[#FF6B00] shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center text-[16px] relative"
              >
                Launch Dashboard <LucideIcons.Rocket className="ml-2 w-5 h-5" fill="currentColor" />
              </button>
              
              <button onClick={finishSetup} className="w-full text-center mt-3 text-[#7C3AED] font-bold text-[13px]">
                Explore features
              </button>
              
              <div className="mt-4 mx-auto w-fit bg-[#FFF8F3] border border-orange-100 rounded-md px-3 py-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] font-bold text-slate-800">Made for Indian Retailers</span>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (

    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[480px] h-[720px] max-h-[95vh] flex flex-col relative overflow-hidden border border-slate-100">
        
        {/* Header - Hidden on success step */}
        {step < 4 && (
          <div className="px-6 pt-6 pb-2 flex flex-col gap-6 bg-white z-10">
            <div className="grid grid-cols-3 items-center w-full">
              <div className="flex justify-start">
                <button className="text-slate-500 p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors" onClick={() => step > 1 ? handleBack() : router.back()}>
                  <LucideIcons.ArrowLeft size={24} />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0"
                   style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}>
                  <Zap className="w-4 h-4 text-white" fill="white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-extrabold text-lg text-slate-800 tracking-tight leading-none">Retail<span className="text-orange-500">OS</span></span>
                  <span className="text-slate-500 text-[9px] font-black tracking-widest uppercase mt-0.5">Setup</span>
                </div>
              </div>
              <div className="flex justify-end"></div>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center justify-between relative px-2">
              <div className="absolute top-4 left-6 right-6 h-[2px] bg-slate-100 -z-10"></div>
              <div className="absolute top-4 left-6 h-[2px] bg-orange-500 -z-10 transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
              
              {[
                { step: 1, label: 'Business Info' },
                { step: 2, label: 'Preferences' },
                { step: 3, label: 'Ready' }
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center gap-1.5 bg-white px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                    step >= s.step 
                      ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {s.step}
                  </div>
                  <span className={`text-[10px] font-bold ${step >= s.step ? 'text-orange-500' : 'text-slate-400'}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
        
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fde68a;
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #f59e0b;
        }
      `}} />
    </div>
  );
}

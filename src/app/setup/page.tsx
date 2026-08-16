'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import {  Zap, Check, Store, Phone, MapPin, Eye, EyeOff, ChevronRight, ArrowRight, Shield, Map , Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getStoreTypeList, StoreType } from '@/lib/storeTypes';
import { registerStore } from '@/lib/licenseManager';
import WelcomeScreen from '@/components/features/setup/WelcomeScreen';

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
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  
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
            className="flex flex-col h-full absolute inset-0 pb-[140px]"
          >
            <div className="overflow-y-auto px-6 pt-4 pb-6 flex-1 custom-scrollbar w-full">
              
              <div className="flex items-center justify-between mb-8 relative">
                <div className="flex-1 pt-2 z-10 w-[55%]">
                  <h1 className="text-[34px] font-[800] text-[#101B35] mb-2 tracking-tight leading-[1.15]">
                    Let's set up<br/>your <span className="text-[#FF7A00]">store</span> <Sparkles className="inline w-6 h-6 text-amber-400" />
                  </h1>
                  <p className="text-[#64748B] text-[14px] font-medium mt-2">Tell us a little about your business.</p>
                </div>
                <div className="w-[45%] h-40 shrink-0 relative z-0 flex justify-end">
                   <img src="/images/setup_store.jpg" alt="Store setup" className="w-[140%] h-[140%] max-w-none object-contain mix-blend-multiply translate-x-4 -translate-y-4" />
                </div>
              </div>
              
              <div className="flex flex-col gap-4 relative z-10 mt-6">
                <h3 className="text-[13px] font-bold text-[#64748B] tracking-wider uppercase mb-0 -ml-1">Basic Information</h3>
                
                <div className="bg-white border border-[#E8ECF2] rounded-[16px] p-4 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all focus-within:border-[#FF7A00] focus-within:shadow-[0_0_0_2px_rgba(255,122,0,0.1)]">
                  <Store className="w-6 h-6 text-[#FF7A00] shrink-0" strokeWidth={1.5} />
                  <div className="flex-1">
                    <label className="block text-[14px] font-medium text-[#64748B] mb-0.5">Store Name <span className="text-[#FF7A00]">*</span></label>
                    <input type="text" value={storeDetails.storeName} onChange={e => setStoreDetails({...storeDetails, storeName: e.target.value})} placeholder="e.g. Shree Ram Stores" className="w-full bg-transparent border-none outline-none text-[#101B35] font-bold text-[16px] p-0 placeholder:text-slate-300 placeholder:font-normal" />
                  </div>
                </div>

                <div className="bg-white border border-[#E8ECF2] rounded-[16px] p-4 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all focus-within:border-[#FF7A00] focus-within:shadow-[0_0_0_2px_rgba(255,122,0,0.1)]">
                  <LucideIcons.User className="w-6 h-6 text-[#FF7A00] shrink-0" strokeWidth={1.5} />
                  <div className="flex-1">
                    <label className="block text-[14px] font-medium text-[#64748B] mb-0.5">Owner Name <span className="text-[#FF7A00]">*</span></label>
                    <input type="text" value={storeDetails.ownerName} onChange={e => setStoreDetails({...storeDetails, ownerName: e.target.value})} placeholder="e.g. Rajesh Kumar" className="w-full bg-transparent border-none outline-none text-[#101B35] font-bold text-[16px] p-0 placeholder:text-slate-300 placeholder:font-normal" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-[#E8ECF2] rounded-[16px] p-4 flex items-start gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all focus-within:border-[#FF7A00] focus-within:shadow-[0_0_0_2px_rgba(255,122,0,0.1)]">
                    <Phone className="w-6 h-6 text-[#FF7A00] shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 overflow-hidden">
                      <label className="block text-[13px] font-medium text-[#64748B] mb-0.5 whitespace-nowrap">Phone Number <span className="text-[#FF7A00]">*</span></label>
                      <input type="tel" value={storeDetails.phone} onChange={handlePhoneChange} placeholder="98765 43210" maxLength={10} className="w-full bg-transparent border-none outline-none text-[#101B35] font-bold text-[15px] p-0 placeholder:text-slate-300 placeholder:font-normal" />
                    </div>
                  </div>

                  <div className="bg-white border border-[#E8ECF2] rounded-[16px] p-4 flex items-start gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative transition-all focus-within:border-[#FF7A00] focus-within:shadow-[0_0_0_2px_rgba(255,122,0,0.1)]">
                    <LucideIcons.MessageCircle className="w-6 h-6 text-[#22C55E] shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <label className="block text-[13px] font-medium text-[#64748B] mb-0.5 whitespace-nowrap">WhatsApp Number</label>
                      <input type="tel" value={storeDetails.whatsapp} onChange={e => setStoreDetails({...storeDetails, whatsapp: e.target.value})} disabled={sameAsPhone} placeholder="98765 43210" maxLength={10} className={`w-full bg-transparent border-none outline-none text-[#101B35] font-bold text-[15px] p-0 mb-2 placeholder:text-slate-300 placeholder:font-normal ${sameAsPhone ? 'opacity-50' : ''}`} />
                      <label className="flex items-center gap-1.5 text-[12px] text-[#64748B] font-medium cursor-pointer mt-1">
                        <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${sameAsPhone ? 'bg-[#FF7A00] border-[#FF7A00]' : 'border-slate-300'}`}>
                          {sameAsPhone && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <input type="checkbox" checked={sameAsPhone} onChange={handleSameAsPhoneChange} className="sr-only" />
                        Same as phone
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#E8ECF2] rounded-[16px] p-4 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all focus-within:border-[#FF7A00] focus-within:shadow-[0_0_0_2px_rgba(255,122,0,0.1)]">
                  <MapPin className="w-6 h-6 text-[#FF7A00] shrink-0" strokeWidth={1.5} />
                  <div className="flex-1">
                    <label className="block text-[14px] font-medium text-[#64748B] mb-0.5">City <span className="text-[#FF7A00]">*</span></label>
                    <input type="text" value={storeDetails.city} onChange={e => setStoreDetails({...storeDetails, city: e.target.value})} placeholder="e.g. Bengaluru, Karnataka" className="w-full bg-transparent border-none outline-none text-[#101B35] font-bold text-[16px] p-0 placeholder:text-slate-300 placeholder:font-normal" />
                  </div>
                  <LucideIcons.ChevronDown className="w-5 h-5 text-[#64748B]" />
                </div>

                <div className="bg-white border border-[#E8ECF2] rounded-[16px] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setShowMoreDetails(!showMoreDetails)}
                  >
                    <div>
                      <h4 className="text-[14px] font-bold text-[#101B35]">More business details <span className="text-[#64748B] font-medium text-[14px]">(Optional)</span></h4>
                      <p className="text-[13px] text-[#64748B] mt-0.5">GST, UPI ID, Full Address, Pincode...</p>
                    </div>
                    <LucideIcons.ChevronDown className={`w-5 h-5 text-[#64748B] transition-transform duration-300 ${showMoreDetails ? 'rotate-180' : ''}`} />
                  </div>
                  
                  <AnimatePresence>
                    {showMoreDetails && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-[#E8ECF2] bg-slate-50/50"
                      >
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="block text-[13px] font-medium text-[#64748B] mb-1">GST Number</label>
                            <input type="text" value={storeDetails.gstNumber} onChange={e => setStoreDetails({...storeDetails, gstNumber: e.target.value})} placeholder="e.g. 29ABCDE1234F1Z5" className="w-full bg-white border border-[#E8ECF2] rounded-xl p-3 text-[14px] outline-none focus:border-[#FF7A00]" />
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#64748B] mb-1">UPI ID</label>
                            <input type="text" value={storeDetails.upiId} onChange={e => setStoreDetails({...storeDetails, upiId: e.target.value})} placeholder="e.g. storename@bank" className="w-full bg-white border border-[#E8ECF2] rounded-xl p-3 text-[14px] outline-none focus:border-[#FF7A00]" />
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#64748B] mb-1">Full Address</label>
                            <input type="text" value={storeDetails.address} onChange={e => setStoreDetails({...storeDetails, address: e.target.value})} placeholder="e.g. #123, Main Market Road" className="w-full bg-white border border-[#E8ECF2] rounded-xl p-3 text-[14px] outline-none focus:border-[#FF7A00]" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Your Store Preview */}
                <div className="bg-[#FFF9F0] border border-[#E8ECF2] rounded-[24px] p-5 mt-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="text-[15px] font-bold text-[#101B35]">Your Store Preview</h4>
                    <div className="bg-green-50 text-[#22C55E] px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-green-100">
                      <span className="text-[11px] font-bold tracking-wider uppercase">LIVE</span>
                      <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                    </div>
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
                      <h3 className="text-[18px] font-bold text-[#101B35] leading-tight mb-1">{storeDetails.storeName || 'Shree Ram Stores'}</h3>
                      <p className="text-[#64748B] font-medium text-[13px] mb-1">{selectedType?.name || 'Grocery / Kirana'}</p>
                      <div className="flex items-center gap-1 text-[#64748B] text-[12px] font-medium">
                        <MapPin className="w-3.5 h-3.5" /> {storeDetails.city || 'Bengaluru, Karnataka'}
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
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center`}>
                          <item.icon className={`w-5 h-5 ${item.color}`} strokeWidth={1.5} />
                        </div>
                        <span className="text-[11px] font-bold text-[#101B35] text-center leading-tight">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full pt-4 pb-6 px-6 bg-white z-50">
              <button
                onClick={handleComplete}
                disabled={loading || !storeDetails.storeName || !storeDetails.ownerName || !storeDetails.phone || !storeDetails.city}
                className={`w-full h-[56px] rounded-[16px] font-bold text-white flex items-center justify-center transition-all text-[17px] active:scale-[0.98] ${
                  storeDetails.storeName && storeDetails.ownerName && storeDetails.phone && storeDetails.city && !loading
                    ? 'bg-gradient-to-r from-[#FF7A00] to-[#FF4D00] shadow-[0_4px_14px_rgba(255,122,0,0.25)] hover:from-[#FF6B00] hover:to-[#E64500]' 
                    : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed opacity-70'
                }`}
              >
                {loading ? 'Saving...' : 'Continue'} {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
              </button>
              <div className="text-center mt-4 flex items-center justify-center gap-1.5 text-[#64748B] text-[13px] font-medium">
                <LucideIcons.Lock className="w-4 h-4" /> Your data is safe and secure
              </div>
            </div>
          </motion.div>
        );

    }
  };

  if (step === 4) {
    return <WelcomeScreen storeDetails={storeDetails} selectedType={selectedType} onFinish={finishSetup} />;
  }

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
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0"
                   style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}>
                  <Zap className="w-5 h-5 text-white" fill="white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-extrabold text-2xl text-slate-800 tracking-tight leading-none">Retail<span className="text-[#FF6B00]">OS</span></span>
                  <span className="text-slate-500 text-[10px] font-black tracking-widest uppercase mt-1">Setup Your Store</span>
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

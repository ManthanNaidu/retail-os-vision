'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, Store, Phone, MapPin, Eye, EyeOff, ChevronRight, ArrowRight, Shield, Map } from 'lucide-react';
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
    email: '',
    city: '',
    address: '',
    gstNumber: '',
    upiId: ''
  });
  
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
    if (step === 2 && (!storeDetails.storeName || !storeDetails.ownerName)) return;
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
            
            <div className="grid grid-cols-2 gap-3 mb-6 overflow-y-auto pr-2 custom-scrollbar">
              {storeTypes.map(type => {
                const IconComp = (LucideIcons as any)[type.iconName] || LucideIcons.Store;
                const isSelected = selectedType?.id === type.id;
                
                return (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(type)}
                    className={`p-4 rounded-2xl border-2 text-left flex flex-col items-center justify-center transition-all ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-500/10' 
                        : 'border-amber-100 bg-[#fffdf8] hover:border-orange-300 hover:bg-amber-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors overflow-hidden ${
                      isSelected ? 'bg-orange-500 text-white ring-4 ring-orange-500/20' : 'bg-amber-100 text-orange-600'
                    }`}>
                      {type.image ? (
                        <img src={type.image} alt={type.name} className="w-full h-full object-cover" />
                      ) : (
                        <IconComp size={24} strokeWidth={2.5} />
                      )}
                    </div>
                    <span className={`font-bold text-sm text-center ${isSelected ? 'text-orange-700' : 'text-slate-700'}`}>
                      {type.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            
            <div className="mt-auto pt-2 bg-white">
              <button
                onClick={handleNext}
                disabled={!selectedType}
                className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center transition-all text-[15px] ${
                  selectedType 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-orange-500/25 active:scale-[0.98]' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                Continue <ArrowRight className="ml-2 w-5 h-5" />
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
            className="flex flex-col h-full"
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">Store Details</h1>
              <p className="text-slate-500 text-sm font-medium">Let's set up your business profile.</p>
            </div>
            
            <div className="space-y-4 mb-4 overflow-y-auto pr-2 flex-1 custom-scrollbar pb-10">
              
              {/* Box 1: Core Details */}
              <div className="bg-[#fffdf8] border border-amber-100 rounded-2xl p-4 shadow-sm">
                <div className="mb-4">
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Store Name <span className="text-orange-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-400">
                      <Store className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={storeDetails.storeName}
                      onChange={(e) => setStoreDetails({...storeDetails, storeName: e.target.value})}
                      placeholder="e.g. Shree Ram Medical Store"
                      className="w-full !pl-[44px] pr-4 py-3 bg-white border border-amber-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400 shadow-inner shadow-amber-500/5"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Owner Name <span className="text-orange-500">*</span></label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-400">
                      <Shield className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={storeDetails.ownerName}
                      onChange={(e) => setStoreDetails({...storeDetails, ownerName: e.target.value})}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full !pl-[44px] pr-4 py-3 bg-white border border-amber-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400 shadow-inner shadow-amber-500/5"
                    />
                  </div>
                </div>
              </div>

              {/* Box 2: Location */}
              <div className="bg-[#fffdf8] border border-amber-100 rounded-2xl p-4 shadow-sm">
                 <div className="mb-4">
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">City</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={storeDetails.city}
                      onChange={(e) => setStoreDetails({...storeDetails, city: e.target.value})}
                      placeholder="e.g. Mumbai"
                      className="w-full !pl-[44px] pr-4 py-3 bg-white border border-amber-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400 shadow-inner shadow-amber-500/5"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Full Address <span className="text-slate-400 normal-case font-medium">(Optional)</span></label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-3.5 pointer-events-none text-orange-400">
                      <Map className="w-5 h-5" />
                    </div>
                    <textarea
                      value={storeDetails.address}
                      onChange={(e) => setStoreDetails({...storeDetails, address: e.target.value})}
                      placeholder="Street, Landmark, Pincode..."
                      rows={2}
                      className="w-full !pl-[44px] pr-4 py-3 bg-white border border-amber-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400 shadow-inner shadow-amber-500/5 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Box 3: Business Info */}
              <div className="bg-[#fffdf8] border border-amber-100 rounded-2xl p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide truncate">GST <span className="text-slate-400 normal-case font-medium">(Opt)</span></label>
                    <input
                      type="text"
                      value={storeDetails.gstNumber}
                      onChange={(e) => setStoreDetails({...storeDetails, gstNumber: e.target.value})}
                      placeholder="27AAAA..."
                      maxLength={15}
                      className="w-full px-3 py-3 bg-white border border-amber-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-800 font-bold uppercase placeholder:text-slate-400 placeholder:normal-case shadow-inner shadow-amber-500/5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide truncate">UPI <span className="text-slate-400 normal-case font-medium">(Opt)</span></label>
                    <input
                      type="text"
                      value={storeDetails.upiId}
                      onChange={(e) => setStoreDetails({...storeDetails, upiId: e.target.value})}
                      placeholder="store@upi"
                      className="w-full px-3 py-3 bg-white border border-amber-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400 shadow-inner shadow-amber-500/5 text-sm"
                    />
                  </div>
                </div>
              </div>

            </div>
            
            <div className="flex gap-3 mt-auto pt-4 border-t border-amber-100 bg-white">
              <button
                onClick={handleBack}
                className="px-6 py-4 rounded-2xl font-bold text-slate-600 bg-amber-50 hover:bg-amber-100 active:scale-[0.98] transition-all"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={loading || !storeDetails.storeName || !storeDetails.ownerName}
                className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center transition-all text-[15px] ${
                  storeDetails.storeName && storeDetails.ownerName && !loading
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-orange-500/25 active:scale-[0.98]' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {loading ? 'Setting up...' : 'Finish Setup'} {!loading && <Check className="ml-2 w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        );
        
      case 4:
        const FinalIconComp = selectedType ? ((LucideIcons as any)[selectedType.iconName] || LucideIcons.Store) : LucideIcons.Store;
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-full text-center relative pt-10"
          >
            {/* Attractive Background Header */}
            <div className="absolute top-[-32px] left-[-32px] right-[-32px] h-[240px] bg-gradient-to-b from-amber-100/80 via-orange-50/50 to-transparent -z-10 rounded-t-[2rem]">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #f59e0b 0%, transparent 70%)' }}></div>
              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-10 w-16 h-16 opacity-30 rounded-2xl shadow-lg overflow-hidden"
              >
                <img src="/images/icons/icon_home.jpg" alt="Decor" className="w-full h-full object-cover blur-[1px]" />
              </motion.div>
              <motion.div 
                animate={{ y: [0, 15, 0], rotate: [0, -10, 10, 0] }} 
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-16 right-10 w-12 h-12 opacity-30 rounded-2xl shadow-lg overflow-hidden"
              >
                <img src="/images/icons/icon_setup.jpg" alt="Decor" className="w-full h-full object-cover blur-[1px]" />
              </motion.div>
            </div>

            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-28 h-28 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/30 border-4 border-white rotate-3"
            >
              <Check className="w-14 h-14 text-white drop-shadow-md" strokeWidth={3} />
            </motion.div>
            
            <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">All Set!</h1>
            <p className="text-slate-500 font-medium mb-8">Your smart store is ready to go.</p>
            
            <div className="bg-[#fffdf8] rounded-3xl p-8 w-full mb-auto border border-amber-100 shadow-xl shadow-amber-500/5 relative overflow-hidden group hover:border-orange-200 transition-colors">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400"></div>
              
              <div className="w-20 h-20 rounded-[2rem] bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-5 overflow-hidden shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                 {selectedType?.image ? (
                   <img src={selectedType.image} alt="Store type" className="w-full h-full object-cover" />
                 ) : (
                   <FinalIconComp size={36} strokeWidth={2} />
                 )}
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-1">{storeDetails.storeName}</h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-orange-700 font-bold text-xs tracking-wide uppercase">{selectedType?.name}</p>
              </div>
            </div>
            
            <div className="mt-8 pt-4 bg-white">
              <button
                onClick={finishSetup}
                className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-[0.98] hover:-translate-y-1 transition-all flex items-center justify-center text-lg overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full skew-x-12 transition-transform duration-700 ease-out"></div>
                <span className="relative z-10 flex items-center">Launch Dashboard <Zap className="ml-2 w-6 h-6 fill-white drop-shadow-md" /></span>
              </button>
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
          <div className="px-8 pt-8 pb-4 flex flex-col gap-5 bg-white z-10">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20"
                 style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}>
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-extrabold text-xl text-slate-800 tracking-tight leading-none">RetailOS</span>
                <span className="text-orange-500 text-[10px] font-black tracking-widest uppercase mt-0.5">Setup</span>
              </div>
            </div>
            
            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mt-2">
              {[1, 2].map(i => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step ? 'w-10 bg-orange-500' : 
                    i < step ? 'w-3 bg-orange-300' : 'w-3 bg-amber-100'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Content Area */}
        <div className="flex-1 px-8 pb-8 pt-2 overflow-hidden relative flex flex-col">
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

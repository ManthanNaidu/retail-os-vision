'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, Store, Phone, MapPin, Eye, EyeOff, ChevronRight, ArrowRight, Shield } from 'lucide-react';
import { getStoreTypeList, StoreType } from '@/lib/storeTypes';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [storeTypes, setStoreTypes] = useState<StoreType[]>([]);
  
  const [selectedType, setSelectedType] = useState<StoreType | null>(null);
  
  const [storeDetails, setStoreDetails] = useState({
    storeName: '',
    ownerName: '',
    phone: '',
    city: '',
    address: '',
    gstNumber: '',
    upiId: ''
  });
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  useEffect(() => {
    // Load store types
    try {
      const types = getStoreTypeList();
      setStoreTypes(types);
    } catch (error) {
      console.error("Failed to load store types", error);
    }

    // Pre-fill phone from auth
    try {
      const authStr = sessionStorage.getItem('retailos_auth');
      if (authStr) {
        const auth = JSON.parse(authStr);
        if (auth.phone) {
          setStoreDetails(prev => ({ ...prev, phone: auth.phone }));
        }
      }
    } catch (error) {
      console.error("Failed to parse auth", error);
    }
  }, []);
  
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
      // Setup completion logic
      const authStr = sessionStorage.getItem('retailos_auth');
      const auth = authStr ? JSON.parse(authStr) : {};
      
      const profile = {
        storeType: selectedType?.id,
        storeName: storeDetails.storeName,
        ownerName: storeDetails.ownerName,
        phone: storeDetails.phone,
        city: storeDetails.city,
        address: storeDetails.address,
        gstNumber: storeDetails.gstNumber,
        upiId: storeDetails.upiId,
        setupComplete: true,
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('retailos_profile', JSON.stringify(profile));
      
      if (password) {
        localStorage.setItem(`retailos_pwd_${storeDetails.phone}`, password);
      }
      
      sessionStorage.setItem('retailos_auth', JSON.stringify({
        ...auth,
        name: storeDetails.ownerName,
        store: storeDetails.storeName,
        loggedIn: true
      }));
      
      // Simulate API call delay
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
              <h1 className="text-2xl font-bold text-slate-800 mb-2">What do you sell?</h1>
              <p className="text-slate-500 text-sm">Choose your store type to customize RetailOS for your business.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6 overflow-y-auto pr-1">
              {storeTypes.map(type => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType(type)}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col items-center justify-center transition-colors ${
                    selectedType?.id === type.id 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-4xl mb-2">{type.emoji}</span>
                  <span className="font-medium text-slate-800 text-center">{type.name}</span>
                </motion.button>
              ))}
            </div>
            
            <div className="mt-auto">
              <button
                onClick={handleNext}
                disabled={!selectedType}
                className={`w-full py-3.5 rounded-xl font-medium text-white shadow-sm flex items-center justify-center transition-all ${
                  selectedType ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
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
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Store Details</h1>
              <p className="text-slate-500 text-sm">Let's set up your business profile.</p>
            </div>
            
            <div className="space-y-4 mb-6 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Store Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Store className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={storeDetails.storeName}
                    onChange={(e) => setStoreDetails({...storeDetails, storeName: e.target.value})}
                    placeholder="e.g. Shree Ram Medical Store"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={storeDetails.ownerName}
                    onChange={(e) => setStoreDetails({...storeDetails, ownerName: e.target.value})}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={storeDetails.phone}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={storeDetails.city}
                    onChange={(e) => setStoreDetails({...storeDetails, city: e.target.value})}
                    placeholder="e.g. Mumbai"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address (Optional)</label>
                <textarea
                  value={storeDetails.address}
                  onChange={(e) => setStoreDetails({...storeDetails, address: e.target.value})}
                  placeholder="Full store address..."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GST Number (Optional)</label>
                  <input
                    type="text"
                    value={storeDetails.gstNumber}
                    onChange={(e) => setStoreDetails({...storeDetails, gstNumber: e.target.value})}
                    placeholder="27AAAA0000A1Z5"
                    maxLength={15}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">UPI ID (Optional)</label>
                  <input
                    type="text"
                    value={storeDetails.upiId}
                    onChange={(e) => setStoreDetails({...storeDetails, upiId: e.target.value})}
                    placeholder="store@upi"
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100">
              <button
                onClick={handleBack}
                className="px-6 py-3.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!storeDetails.storeName || !storeDetails.ownerName}
                className={`flex-1 py-3.5 rounded-xl font-medium text-white shadow-sm flex items-center justify-center transition-all ${
                  storeDetails.storeName && storeDetails.ownerName 
                    ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]' 
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Set a password for easy login</h1>
              <p className="text-slate-500 text-sm px-4">Create a password so you don't have to wait for an OTP every time.</p>
            </div>
            
            <div className="space-y-4 mb-8 flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Create Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 4 characters"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
                />
              </div>
              
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-sm">Passwords do not match.</p>
              )}
            </div>
            
            <div className="flex flex-col gap-3 mt-auto">
              <button
                onClick={handleComplete}
                disabled={loading || (password.length > 0 && (password.length < 4 || password !== confirmPassword))}
                className="w-full py-3.5 rounded-xl font-medium text-white bg-blue-600 shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting up...' : (password ? 'Save & Finish' : 'Finish Setup')}
              </button>
              
              {!password && (
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Skip, I'll use OTP instead
                </button>
              )}
              
              <button
                onClick={handleBack}
                disabled={loading}
                className="mt-2 text-slate-400 text-sm hover:text-slate-600"
              >
                Go back
              </button>
            </div>
          </motion.div>
        );
        
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
            >
              <Check className="w-10 h-10 text-green-600" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-slate-800 mb-3">All Set!</h1>
            
            <div className="bg-slate-50 rounded-2xl p-6 w-full mb-8 border border-slate-100">
              <div className="text-4xl mb-3">{selectedType?.emoji}</div>
              <h2 className="text-xl font-bold text-slate-800">{storeDetails.storeName}</h2>
              <p className="text-slate-500">{selectedType?.name} • {storeDetails.city || 'Ready for business'}</p>
            </div>
            
            <p className="text-slate-600 mb-8 max-w-[280px]">
              Welcome to RetailOS AI. Your smart store management system is ready.
            </p>
            
            <button
              onClick={finishSetup}
              className="w-full py-4 rounded-xl font-bold text-white bg-green-600 shadow-md shadow-green-200 hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center text-lg"
            >
              Start Using RetailOS <Zap className="ml-2 w-5 h-5" />
            </button>
          </motion.div>
        );
    }
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e8f5e9 100%)' }}>
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-[480px] h-[650px] max-h-[90vh] flex flex-col relative overflow-hidden">
        
        {/* Header - Hidden on success step */}
        {step < 4 && (
          <div className="px-6 pt-6 pb-4 flex flex-col gap-4 bg-white z-10 border-b border-slate-50">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-800 tracking-tight">RetailOS <span className="text-blue-600">AI</span></span>
            </div>
            
            {/* Progress Dots */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? 'w-8 bg-blue-600' : 
                    i < step ? 'w-2 bg-blue-600' : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Content Area */}
        <div className="flex-1 p-6 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
}

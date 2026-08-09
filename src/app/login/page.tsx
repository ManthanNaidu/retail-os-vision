'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Store, Phone, ArrowRight, RefreshCw, Eye, EyeOff, Zap, Shield, Check, AlertTriangle, ChevronRight, Lock } from 'lucide-react';
import { registerStore, isStoreActive, getStoreByPhone } from '@/lib/licenseManager';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [loginMode, setLoginMode] = useState<'otp' | 'password'>('otp');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const demoAccounts = [
    { phone: '9876543200', label: 'Medical Store' },
    { phone: '9845001234', label: 'Grocery Store' },
    { phone: '9900112233', label: 'Electronics' }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Focus first OTP input when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      const firstInput = otpRefs.current[0];
      if (firstInput) firstInput.focus();
    }
  }, [step]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (loginMode === 'otp') {
        setStep('otp');
        setCountdown(30);
      } else {
        setStep('password');
      }
    }, 600);
  };

  const verifySuccess = async () => {
    setLoading(true);
    try {
      const active = isStoreActive(phone);
      if (!active) {
        setError('Access suspended. Contact RetailOS support.');
        setLoading(false);
        return;
      }

      let storeData: any;
      if (typeof getStoreByPhone === 'function') {
        storeData = getStoreByPhone(phone);
      }
      
      const name = storeData?.ownerName || 'Demo Owner';
      const storeName = storeData?.storeName || 'Demo Store';

      if (typeof registerStore === 'function') {
        registerStore(phone, name, storeName);
      }

      sessionStorage.setItem('retailos_auth', JSON.stringify({
        phone,
        name,
        store: storeName,
        role: 'owner',
        loggedIn: true
      }));

      const hasProfile = localStorage.getItem('retailos_profile');
      
      if (!hasProfile) {
        router.push('/setup');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during verification.');
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    setError('');

    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(d => d !== '')) {
      handleOtpSubmit(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = (code: string) => {
    if (code !== '123456') {
      setError('Invalid OTP. Use 123456 for demo.');
      return;
    }
    verifySuccess();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== '1234' && password !== 'admin') {
      setError('Invalid password. Demo: use password 1234');
      return;
    }
    verifySuccess();
  };

  const renderPhoneStep = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to RetailOS AI</h2>
        <p className="text-white/60">Manage your retail store intelligently</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {demoAccounts.map(acc => (
          <button
            key={acc.phone}
            type="button"
            onClick={() => { setPhone(acc.phone); setError(''); }}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1"
          >
            <Store className="w-3 h-3" />
            {acc.phone} / {acc.label}
          </button>
        ))}
      </div>

      <form onSubmit={handlePhoneSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">Phone Number</label>
          <div className="relative flex items-center">
            <div className="absolute left-0 top-0 bottom-0 px-3 flex items-center bg-white/5 border-r border-white/10 rounded-l-xl">
              <span className="text-white/60 text-sm font-medium">+91</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10 digit number"
              className="w-full bg-white/5 border border-white/15 rounded-xl py-3 pl-16 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || phone.length !== 10}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Continue <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => setLoginMode(m => m === 'otp' ? 'password' : 'otp')}
          className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1 mx-auto"
        >
          {loginMode === 'otp' ? 'Use Password instead' : 'Use OTP instead'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const renderOtpStep = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Verify Phone</h2>
        <p className="text-white/60 text-sm">
          Code sent to <span className="font-semibold text-white">+91 {phone.slice(0,2)}****{phone.slice(-4)}</span>
        </p>
        <button
          onClick={() => { setStep('phone'); setOtp(['','','','','','']); setError(''); }}
          className="text-blue-400 text-sm mt-1 hover:text-blue-300 transition-colors"
        >
          Change number
        </button>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              if (el) otpRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(idx, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
            className="w-12 h-14 text-center text-xl font-bold bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-4">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="text-center mt-6">
        <button
          type="button"
          disabled={countdown > 0}
          onClick={() => {
            setCountdown(30);
            setError('');
          }}
          className="text-sm text-white/60 hover:text-white transition-colors disabled:opacity-50 disabled:hover:text-white/60"
        >
          {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
        </button>
        <p className="text-xs text-white/40 mt-4">Demo: accept 123456 as valid OTP</p>
      </div>
    </motion.div>
  );

  const renderPasswordStep = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Enter Password</h2>
        <p className="text-white/60 text-sm">
          Logging in as <span className="font-semibold text-white">+91 {phone}</span>
        </p>
        <button
          onClick={() => { setStep('phone'); setPassword(''); setError(''); }}
          className="text-blue-400 text-sm mt-1 hover:text-blue-300 transition-colors"
        >
          Change number
        </button>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <div>
          <div className="relative flex items-center">
            <div className="absolute left-0 top-0 bottom-0 px-3 flex items-center">
              <Lock className="w-5 h-5 text-white/40" />
            </div>
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-white/5 border border-white/15 rounded-xl py-3 pl-10 pr-10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-0 top-0 bottom-0 px-3 flex items-center text-white/40 hover:text-white/80 transition-colors"
            >
              {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-white/40 mt-2">Demo: use password 1234 or admin</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            'Login'
          )}
        </button>
      </form>

      <div className="text-center mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => { setStep('otp'); setLoginMode('otp'); setError(''); setCountdown(30); }}
          className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1 mx-auto"
        >
          Forgot password? Use OTP instead
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div 
      className="min-h-screen flex flex-col justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* CSS dots pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', 
            backgroundSize: '32px 32px' 
          }} 
        />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-xl mb-4">
            <div className="w-full h-full bg-[#0f172a] rounded-[14px] flex items-center justify-center">
              <Zap className="w-8 h-8 text-blue-400 fill-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
            RetailOS <span className="text-blue-400">AI</span>
          </h1>
        </div>

        {/* Main Card */}
        <div 
          className="rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          style={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Subtle top border highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <AnimatePresence mode="wait">
            {step === 'phone' && <div key="phone">{renderPhoneStep()}</div>}
            {step === 'otp' && <div key="otp">{renderOtpStep()}</div>}
            {step === 'password' && <div key="password">{renderPasswordStep()}</div>}
          </AnimatePresence>
        </div>

        {/* Feature Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-3 opacity-60">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white">
            <Zap className="w-3 h-3" /> AI-Powered
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white">
            <Check className="w-3 h-3" /> GST Ready
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white">
            <Phone className="w-3 h-3" /> WhatsApp
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white">
            <Shield className="w-3 h-3" /> Offline Capable
          </div>
        </div>
      </div>
    </div>
  );
}

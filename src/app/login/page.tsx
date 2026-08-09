'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, RefreshCw, AlertTriangle, Shield, Check, Zap, Sparkles } from 'lucide-react';
import { registerStore, isStoreActive } from '@/lib/licenseManager';
import { auth, setupRecaptcha } from '@/lib/firebase';
import { signInWithPhoneNumber } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setupRecaptcha('recaptcha-container');
  }, []);

  useEffect(() => {
    if (step === 'otp') {
      const firstInput = otpRefs.current[0];
      if (firstInput) firstInput.focus();
    }
  }, [step]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = `+91${phone}`;
      
      const confResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confResult);
      setStep('otp');
    } catch (err: any) {
      console.error("OTP Send Error:", err);
      setError(err.message || 'Failed to send OTP. Try again.');
      
      // Reset reCAPTCHA so the user can try again
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.render().then(function(widgetId: any) {
          (window as any).grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const verifySuccess = async (code: string) => {
    setLoading(true);
    try {
      if (confirmationResult) {
        await confirmationResult.confirm(code);
      } else if (code !== '123456') { // Fallback demo
        throw new Error('Invalid OTP');
      }

      const active = await isStoreActive(phone);
      if (!active) {
        setError('Access suspended. Contact RetailOS support.');
        setLoading(false);
        return;
      }

      await registerStore(phone, "", "");

      sessionStorage.setItem('retailos_auth', JSON.stringify({
        phone,
        name: 'Demo Owner',
        store: 'Demo Store',
        role: 'owner',
        loggedIn: true
      }));

      const hasProfile = localStorage.getItem('retailos_profile');
      if (!hasProfile) {
        router.push('/setup');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error("OTP Verify Error:", err);
      setError('Invalid OTP. Please try again.');
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
      verifySuccess(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #3b2c6e 50%, #0f172a 100%)' }}
    >
      <div id="recaptcha-container" className="fixed bottom-0 right-0 opacity-0 pointer-events-none z-[-1]"></div>

      {/* Abstract Animated Shapes */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/20 blur-[100px] mix-blend-screen pointer-events-none"
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-12 lg:gap-24">
        
        {/* Left Side: Branding & Typography */}
        <div className="flex-1 text-center md:text-left pt-10 md:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-300 text-sm font-medium mb-6 shadow-xl backdrop-blur-md">
              <Sparkles className="w-4 h-4" /> Next Generation POS
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Retail<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">OS</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-light max-w-xl mx-auto md:mx-0 mb-10 leading-relaxed">
              Experience the future of retail management. Powerful, intuitive, and designed to scale your business with intelligent AI automation.
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5">
                <Shield className="w-5 h-5 text-emerald-400" /> Secure Login
              </div>
              <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5">
                <Zap className="w-5 h-5 text-amber-400" /> Instant Access
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Glassmorphic Auth Card */}
        <div className="w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            
            <AnimatePresence mode="wait">
              {step === 'phone' ? (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-400">Enter your phone number to sign in securely.</p>
                  </div>

                  <form onSubmit={handlePhoneSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                      <div className="relative flex items-center group">
                        <div className="absolute left-0 top-0 bottom-0 px-4 flex items-center bg-white/5 border-r border-white/10 rounded-l-2xl transition-colors group-focus-within:bg-white/10">
                          <span className="text-slate-300 font-medium">+91</span>
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Enter 10 digit number"
                          className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-20 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-lg tracking-wide"
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || phone.length !== 10}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {loading ? (
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          Continue to Dashboard <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Verify Phone</h2>
                    <p className="text-slate-400">
                      We sent a code to <span className="font-semibold text-white">+91 {phone}</span>
                    </p>
                    <button
                      onClick={() => { setStep('phone'); setOtp(['','','','','','']); setError(''); }}
                      className="text-blue-400 text-sm mt-2 hover:text-blue-300 transition-colors font-medium"
                    >
                      Wrong number? Edit here
                    </button>
                  </div>

                  <div className="flex justify-between gap-2">
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
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-black/20 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner"
                      />
                    ))}
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <div className="pt-4 text-center">
                    {loading ? (
                      <div className="flex justify-center">
                        <RefreshCw className="w-6 h-6 text-white animate-spin" />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">
                        Didn't receive the code?{' '}
                        <button onClick={() => setStep('phone')} className="text-white hover:text-blue-300 font-medium transition-colors">
                          Resend
                        </button>
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

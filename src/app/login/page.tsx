'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Store, Phone, ArrowRight, ChevronRight, RefreshCw,
  Zap, Shield, TrendingUp, Check, AlertCircle,
  MessageSquare, Edit2, Clock, Lock
} from 'lucide-react';
import { registerStore, isStoreActive, getDaysRemaining, getStoreByPhone } from '@/lib/licenseManager';

const DEMO_ACCOUNTS = [
  { phone: '9876543200', otp: '123456', name: 'Rajesh Kumar', role: 'Owner', store: 'Shree Ram Medical & General' },
  { phone: '9876543201', otp: '654321', name: 'Ramesh Babu', role: 'Cashier', store: 'Shree Ram Medical & General' },
];

const FEATURES = [
  { icon: TrendingUp, text: 'AI-powered profit insights' },
  { icon: Zap, text: 'Instant billing in seconds' },
  { icon: Shield, text: 'Bank-grade data security' },
];

function OtpInput({ otp, setOtp, length = 6 }: { otp: string; setOtp: (v: string) => void; length?: number }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = otp.split('');
    newOtp[i] = val.slice(-1);
    const joined = newOtp.join('');
    setOtp(joined);
    if (val && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    setOtp(pasted.padEnd(length, ''));
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <motion.input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          whileFocus={{ scale: 1.08 }}
          className="w-11 h-13 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all focus:border-blue-500"
          style={{
            height: '52px',
            background: otp[i] ? 'var(--primary-light)' : 'var(--bg-pearl)',
            borderColor: otp[i] ? 'var(--primary)' : 'var(--border)',
            color: 'var(--text-primary)',
          }}
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchedUser, setMatchedUser] = useState<typeof DEMO_ACCOUNTS[0] | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpSentCount, setOtpSentCount] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Auto-verify when 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && step === 'otp') {
      handleVerifyOtp();
    }
  }, [otp]);

  const handleSendOtp = async () => {
    setError('');
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const user = DEMO_ACCOUNTS.find(u => u.phone === phone)
      || { phone, otp: '123456', name: 'Store Owner', role: 'Owner', store: 'My Retail Store' };
    setMatchedUser(user);
    setLoading(false);
    setOtpSent(true);
    setOtpSentCount(c => c + 1);
    setCountdown(30);
    setStep('otp');
    setOtp('');
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6 || loading) return;
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));

    const isCorrect = otp === matchedUser?.otp || otp === '123456';
    if (!isCorrect) {
      setLoading(false);
      setError('Incorrect OTP. Use 123456 for demo.');
      setOtp('');
      return;
    }

    // Check license
    if (!isStoreActive(phone)) {
      const storeData = getStoreByPhone(phone);
      setLoading(false);
      setError(`Access suspended. Your license has expired. Please contact RetailOS support to renew.`);
      setOtp('');
      return;
    }

    // Register / update store record
    registerStore(phone, matchedUser?.name || 'Store Owner', matchedUser?.store || 'My Store');
    const daysLeft = getDaysRemaining(phone);

    sessionStorage.setItem('retailos_auth', JSON.stringify({ ...matchedUser, loggedIn: true, daysLeft }));
    router.push('/dashboard');
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setOtp('');
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setOtpSentCount(c => c + 1);
    setCountdown(30);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    sessionStorage.setItem('retailos_auth', JSON.stringify({ ...DEMO_ACCOUNTS[0], loggedIn: true }));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--bg-warm)' }}>
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-[0.07]"
          style={{ background: 'var(--primary)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-[0.06]"
          style={{ background: 'var(--accent)', filter: 'blur(50px)' }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 relative z-10">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-xl"
            style={{ boxShadow: 'var(--shadow-blue)' }}>
            <Store size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            RetailOS <span style={{ color: 'var(--primary)' }}>AI</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your intelligent business partner</p>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="w-full max-w-sm">
          <div className="card p-6 rounded-3xl" style={{ boxShadow: '0 20px 60px rgba(15,26,46,0.10)' }}>
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Phone Number ── */}
              {step === 'phone' && (
                <motion.div key="phone"
                  initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                  <div className="mb-5">
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      We'll send an OTP to your WhatsApp
                    </p>
                  </div>

                  {/* Phone field */}
                  <div className="mb-4">
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <Phone size={15} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-sm font-medium border-r pr-2"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>+91</span>
                      </div>
                      <input
                        type="tel"
                        className="input-premium pl-20 text-sm font-semibold tracking-wider"
                        placeholder="9876543200"
                        value={phone}
                        onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                        maxLength={10}
                        autoFocus
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs font-medium text-red-600"
                        style={{ background: '#fee2e2' }}>
                        <AlertCircle size={13} /> {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* WhatsApp OTP button */}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={handleSendOtp} disabled={loading || phone.length !== 10}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: phone.length === 10 ? 'var(--primary)' : '#e2e8f0',
                      color: phone.length === 10 ? 'white' : 'var(--text-muted)',
                      boxShadow: phone.length === 10 ? 'var(--shadow-blue)' : 'none',
                    }}>
                    {loading
                      ? <><RefreshCw size={16} className="animate-spin" /> Sending OTP...</>
                      : <><MessageSquare size={16} /> Send OTP via WhatsApp</>}
                  </motion.button>

                  {/* Demo */}
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-center text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                      New here? Try the instant demo
                    </p>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={handleDemoLogin} disabled={loading}
                      className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 border hover:border-blue-300 hover:bg-blue-50 transition-all"
                      style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}>
                      {loading ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
                      {loading ? 'Loading...' : 'Launch Demo Store'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: OTP Verification ── */}
              {step === 'otp' && (
                <motion.div key="otp"
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}>
                  {/* Back + user info */}
                  <div className="flex items-center gap-2 mb-5">
                    <button onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                      className="w-8 h-8 rounded-xl border flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
                      style={{ borderColor: 'var(--border)' }}>
                      <ChevronRight size={16} className="rotate-180" style={{ color: 'var(--text-secondary)' }} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                        {matchedUser?.name || 'Store Owner'}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+91 {phone}</p>
                        <button onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                          className="text-[10px] font-semibold" style={{ color: 'var(--primary)' }}>
                          <Edit2 size={10} className="inline mr-0.5" />Edit
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* OTP sent confirmation */}
                  <AnimatePresence>
                    {otpSent && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-4 text-xs font-medium"
                        style={{ background: '#d1fae5', color: '#065f46' }}>
                        <MessageSquare size={13} className="mt-0.5 flex-shrink-0" />
                        <span>
                          OTP sent to WhatsApp <strong>+91 {phone}</strong>
                          {otpSentCount > 1 && ` (resent ${otpSentCount - 1}×)`}
                          <br />
                          <span className="font-bold">Demo OTP: 123456</span>
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="text-center mb-5">
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Enter OTP</h2>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      6-digit code sent to your WhatsApp
                    </p>
                  </div>

                  {/* 6-digit OTP boxes */}
                  <div className="mb-4">
                    <OtpInput otp={otp} setOtp={setOtp} length={6} />
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2 mb-3 text-xs font-medium text-red-600">
                        <AlertCircle size={13} /> {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Loading */}
                  {loading && (
                    <div className="flex items-center justify-center gap-2 mb-3 text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                      <RefreshCw size={15} className="animate-spin" /> Verifying...
                    </div>
                  )}

                  {/* Verify button */}
                  {!loading && (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={handleVerifyOtp} disabled={otp.length < 6}
                      className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 mb-4 transition-all"
                      style={{
                        background: otp.length === 6 ? 'var(--primary)' : '#e2e8f0',
                        color: otp.length === 6 ? 'white' : 'var(--text-muted)',
                        boxShadow: otp.length === 6 ? 'var(--shadow-blue)' : 'none',
                      }}>
                      <Check size={17} /> Verify OTP & Login
                    </motion.button>
                  )}

                  {/* Resend */}
                  <div className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    Didn't receive it?{' '}
                    {countdown > 0 ? (
                      <span className="font-medium flex items-center justify-center gap-1 mt-1">
                        <Clock size={11} /> Resend in {countdown}s
                      </span>
                    ) : (
                      <button onClick={handleResend}
                        className="font-bold underline" style={{ color: 'var(--primary)' }}>
                        Resend OTP
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Feature chips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mt-7">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <f.icon size={12} style={{ color: 'var(--primary)' }} /> {f.text}
            </div>
          ))}
        </motion.div>

        <p className="mt-6 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
          RetailOS AI v1.0 · Made in India for Indian Retailers
        </p>
      </div>
    </div>
  );
}

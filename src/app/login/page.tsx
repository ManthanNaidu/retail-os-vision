'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Store, ArrowRight, Mail, Lock, Shield, Zap } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { isStoreActive, adminLogin, ADMIN_PASSWORD } from '@/lib/licenseManager';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Intercept Master Admin Login
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'admin@retailos.in' || cleanEmail === 'admin') {
      if (adminLogin(password.trim())) {
        router.push('/admin');
        return;
      }
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      
      const isActive = await isStoreActive(email);
      if (!isActive) {
        setError('Your account has been suspended. Please contact admin.');
        return;
      }
      
      router.push('/setup');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      
      const email = userCred.user.email;
      if (email) {
        const isActive = await isStoreActive(email);
        if (!isActive) {
          setError('Your account has been suspended. Please contact admin.');
          return;
        }
      }

      router.push('/setup');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F3] relative overflow-hidden font-sans">
      
      {/* Top Header */}
      <div className="pt-10 pb-4 px-6 flex flex-col items-center justify-center z-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
               style={{ background: 'linear-gradient(135deg, #FF8C00, #FF6B00)' }}>
            <Zap className="w-7 h-7 text-white" fill="white" />
          </div>
          <div className="flex flex-col items-start -space-y-1">
            <span className="font-extrabold text-[32px] tracking-tight leading-none text-[#1A1A2E]">
              Retail<span className="text-[#FF6B00]">OS</span>
            </span>
          </div>
        </div>
        <p className="text-[#64748B] text-[15px] font-medium mt-1">Your Business. Simplified.</p>
      </div>

      {/* 3D Graphic Area */}
      <div className="w-full max-w-[480px] mx-auto px-4 z-10 relative mt-2 mb-[-2rem]">
        <img 
          src="/images/login_store_graphic.jpg" 
          alt="My Store" 
          className="w-full h-auto object-contain mix-blend-multiply"
        />
      </div>

      {/* Login Card overlay */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md mx-auto z-20 flex-1 flex flex-col justify-end sm:justify-start"
      >
        <div className="bg-white rounded-t-[32px] sm:rounded-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] sm:shadow-2xl px-6 py-8 sm:p-8 w-full border border-slate-100 flex-1 sm:flex-none">
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-black text-[#1A1A2E] mb-1.5 tracking-tight">Welcome back! 👋</h1>
            <p className="text-[#64748B] text-[15px] font-medium">Let's get your business moving.</p>
          </div>
          
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="block text-[14px] font-bold text-[#475569] mb-1.5">Email</label>
              <div className="relative flex items-center border border-slate-200 rounded-2xl bg-white overflow-hidden focus-within:border-[#FF6B00] focus-within:ring-2 focus-within:ring-orange-100 transition-all p-1">
                <div className="w-10 h-10 rounded-xl bg-[#FFF4ED] flex items-center justify-center shrink-0 ml-1">
                  <Mail className="w-5 h-5 text-[#FF6B00]" strokeWidth={2.5} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[#1A1A2E] font-semibold text-[15px] px-3 py-2 placeholder:text-slate-400 placeholder:font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[14px] font-bold text-[#475569]">Password</label>
                <Link href="/forgot-password" className="text-[13px] font-bold text-[#FF6B00] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center border border-slate-200 rounded-2xl bg-white overflow-hidden focus-within:border-[#FF6B00] focus-within:ring-2 focus-within:ring-orange-100 transition-all p-1">
                <div className="w-10 h-10 rounded-xl bg-[#FFF4ED] flex items-center justify-center shrink-0 ml-1">
                  <Lock className="w-5 h-5 text-[#FF6B00]" strokeWidth={2.5} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[#1A1A2E] font-black tracking-widest text-[18px] px-3 py-2 placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 mr-1 text-[#64748B] hover:text-[#1A1A2E] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={2.5} /> : <Eye className="w-5 h-5" strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-[16px] active:scale-[0.98] transition-all bg-[#FF6B00] hover:bg-[#E66000] shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? 'Signing in...' : 'Sign in'} {!loading && <ArrowRight className="w-5 h-5" strokeWidth={2.5} />}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t border-slate-100"></div>
            <span className="text-[13px] font-bold text-[#94A3B8] tracking-widest uppercase">OR</span>
            <div className="flex-1 border-t border-slate-100"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-center gap-3 text-[15px] font-bold text-[#475569] hover:bg-slate-50 active:scale-[0.98] transition-all mb-8"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-[14px] font-medium text-[#64748B]">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-[#FF6B00] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
        
        {/* Footer Security Badge */}
        <div className="py-5 text-center flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#64748B]">
          <Shield className="w-4 h-4 text-[#64748B]" strokeWidth={2.5} />
          Secure login <span className="mx-1 opacity-50">•</span> Your data is safe with us
        </div>
      </motion.div>
    </div>
  );
}

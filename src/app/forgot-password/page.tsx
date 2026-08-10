'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-pearl)] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card p-8 rounded-2xl shadow-xl bg-white border border-[var(--border)]">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
              <Shield className="w-6 h-6 text-[var(--primary)]" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-2">Reset Password</h1>
          <p className="text-center text-[var(--text-secondary)] mb-8">Enter your email and we'll send you a reset link.</p>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex gap-2 items-start">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>Password reset link sent! Check your inbox to continue.</span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="name@company.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 rounded-lg flex items-center justify-center gap-2 bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? 'Sending link...' : (
                  <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            Remember your password?{' '}
            <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
              Back to log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

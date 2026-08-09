'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const auth = JSON.parse(sessionStorage.getItem('retailos_auth') || '{}');
      if (auth.loggedIn) {
        // Check if setup is complete
        const profile = localStorage.getItem('retailos_profile');
        if (!profile) {
          router.replace('/setup');
        } else {
          router.replace('/dashboard');
        }
      } else {
        router.replace('/login');
      }
    } catch {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 16 }}
        className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl"
          style={{ background: 'linear-gradient(135deg, #1a56db, #7c3aed)' }}>
          <Zap size={38} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white text-center">RetailOS AI</h1>
          <p className="text-sm text-white/40 text-center mt-1">Business OS for Indian Retailers</p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              className="w-2.5 h-2.5 rounded-full bg-blue-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

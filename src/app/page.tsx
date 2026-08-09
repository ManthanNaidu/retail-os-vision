'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const auth = sessionStorage.getItem('retailos_auth');
    if (auth) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-warm)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center shadow-xl"
          style={{ boxShadow: 'var(--shadow-blue)' }}>
          <Store size={40} className="text-white" />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--primary)' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity }} />
          ))}
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading RetailOS AI...</p>
      </motion.div>
    </div>
  );
}

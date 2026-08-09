'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/billing', icon: ShoppingCart, label: 'Billing' },
  { href: '/inventory', icon: Package, label: 'Stock' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/ai-assistant', icon: Sparkles, label: 'AI' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden safe-area-bottom">
      <div className="glass border-t border-white/20 px-2 pt-2 pb-safe">
        <div className="flex items-center justify-around">
          {tabs.map(tab => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
            return (
              <Link key={tab.href} href={tab.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-1 py-1 relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                      style={{ background: 'var(--primary)' }}
                    />
                  )}
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
                    isActive ? 'gradient-primary shadow-blue' : 'transparent'
                  )}>
                    <tab.icon
                      size={20}
                      className={isActive ? 'text-white' : 'text-gray-400'}
                    />
                  </div>
                  <span className={cn(
                    'text-[10px] font-semibold transition-colors duration-200',
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  )}>
                    {tab.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

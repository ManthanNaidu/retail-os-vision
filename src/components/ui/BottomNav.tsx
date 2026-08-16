'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, ShoppingCart, Package, Users, Sparkles } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/billing', icon: ShoppingCart, label: 'Billing' },
  { href: '/ai-assistant', icon: Sparkles, label: 'AI' },
  { href: '/inventory', icon: Package, label: 'Stock' },
  { href: '/customers', icon: Users, label: 'Customers' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
      style={{ height: '64px', paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/');
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex-1 flex flex-col items-center justify-center gap-[3px] py-[6px] no-underline"
          >
            {isActive && (
              <motion.div 
                layoutId="nav-indicator"
                className="absolute top-0 w-8 h-[3px] rounded-b-[4px]"
                style={{ background: 'var(--primary)' }}
              />
            )}
            <item.icon 
              size={22} 
              strokeWidth={isActive ? 2.5 : 1.8}
              color={isActive ? 'var(--primary)' : '#9CA3AF'}
            />
            <span 
              className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium text-[#9CA3AF]'}`}
              style={{ color: isActive ? 'var(--primary)' : '#9CA3AF' }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

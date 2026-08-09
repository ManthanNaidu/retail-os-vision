'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart3,
  Truck, Users2, Sparkles, Settings, X, Zap, LogOut, Store
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { getStoreType } from '@/lib/storeTypes';

const navItems = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/billing',      icon: ShoppingCart,    label: 'New Sale' },
  { href: '/inventory',    icon: Package,         label: 'Inventory' },
  { href: '/customers',    icon: Users,           label: 'Customers' },
  { href: '/reports',      icon: BarChart3,       label: 'Reports' },
  { href: '/suppliers',    icon: Truck,           label: 'Suppliers' },
  { href: '/employees',    icon: Users2,          label: 'Team' },
  { href: '/ai-assistant', icon: Sparkles,        label: 'AI Assistant', badge: 'AI' },
  { href: '/settings',     icon: Settings,        label: 'Settings' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [storeName, setStoreName] = useState('Your Store');
  const [storeType, setStoreType] = useState('');
  const [storeEmoji, setStoreEmoji] = useState('🏪');

  useEffect(() => {
    try {
      const profile = JSON.parse(localStorage.getItem('retailos_profile') || '{}');
      if (profile.storeName) setStoreName(profile.storeName);
      if (profile.storeType) {
        const type = getStoreType(profile.storeType);
        setStoreType(type.name);
        setStoreEmoji(type.emoji);
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('retailos_auth');
    router.push('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed left-0 top-0 h-full w-[260px] z-50 lg:translate-x-0 lg:static lg:block flex flex-col"
        style={{ background: 'var(--bg-sidebar)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1a56db, #7c3aed)' }}>
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">RetailOS AI</div>
              <div className="text-blue-300 text-[10px] font-medium tracking-wider">BUSINESS OS</div>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Store info */}
        <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{storeEmoji}</span>
            <div>
              <p className="text-white text-sm font-semibold leading-tight truncate max-w-[170px]">{storeName}</p>
              <p className="text-white/40 text-[10px]">{storeType || 'General Store'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Live</span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="p-3 space-y-0.5 overflow-y-auto flex-1">
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}
                onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
                    isActive
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'text-white/60 hover:bg-white/8 hover:text-white'
                  )}
                >
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded-full font-semibold">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: logout */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </motion.aside>
    </>
  );
}

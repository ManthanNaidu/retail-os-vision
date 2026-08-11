'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart3,
  Truck, Users2, Sparkles, Settings, X, Zap, LogOut, Store, MessageCircle
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { getStoreType } from '@/lib/storeTypes';
import { useAuth } from '@/components/providers/AuthProvider';

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
  { href: 'mailto:support@retailos.in', icon: MessageCircle, label: 'Contact Us' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [storeName, setStoreName] = useState('Your Store');
  const [storeType, setStoreType] = useState('');
  const [storeIcon, setStoreIcon] = useState('Store');

  useEffect(() => {
    try {
      const profile = JSON.parse(localStorage.getItem('retailos_profile') || '{}');
      if (profile.storeName) setStoreName(profile.storeName);
      if (profile.storeType) {
        const type = getStoreType(profile.storeType);
        setStoreType(type.name);
        setStoreIcon(type.iconName);
      }
    } catch {}
  }, []);

  const handleLogout = async () => {
    await logout();
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed left-0 top-0 h-full w-[280px] z-50 lg:translate-x-0 lg:static lg:block flex flex-col bg-[#fffdf8] border-r border-amber-100/50 shadow-[4px_0_24px_rgba(245,158,11,0.03)]"
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-amber-100 flex-shrink-0 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}>
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <div>
              <div className="text-slate-800 font-extrabold text-base tracking-tight leading-none">RetailOS</div>
              <div className="text-orange-500 text-[11px] font-bold tracking-widest mt-1">BUSINESS OS</div>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-orange-500 bg-slate-100 hover:bg-orange-50 p-1.5 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Store info */}
        <div className="px-6 py-5 border-b border-amber-100 flex-shrink-0 bg-white/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shadow-sm">
              {(() => {
                const IconComponent = (LucideIcons as any)[storeIcon] || LucideIcons.Store;
                return <IconComponent size={20} className="text-orange-600" strokeWidth={2.5} />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 text-sm font-bold leading-tight truncate">{storeName}</p>
              <p className="text-slate-500 font-medium text-[11px] mt-0.5 truncate">{storeType || 'General Store'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 px-1">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-emerald-600 text-xs font-bold tracking-wide uppercase">System Live</span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="p-4 space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
          <p className="px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3 mt-2">Main Menu</p>
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}
                onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}>
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group overflow-hidden',
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'text-slate-600 hover:bg-amber-50 hover:text-orange-600'
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  <item.icon size={20} className={cn("transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-orange-500")} />
                  <span className="text-[15px] font-bold tracking-tight z-10">{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      "ml-auto text-[10px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase z-10",
                      isActive ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: logout & tag */}
        <div className="p-5 border-t border-amber-100 flex-shrink-0 flex flex-col gap-4 bg-white/50">
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl text-slate-600 font-bold hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all text-[15px]">
            <LogOut size={18} />
            Secure Logout
          </button>
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-bold tracking-widest uppercase bg-slate-50 px-3 py-1.5 rounded-full">
              Made in India 🇮🇳
            </span>
          </div>
        </div>
      </motion.aside>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fde68a;
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #f59e0b;
        }
      `}} />
    </>
  );
}

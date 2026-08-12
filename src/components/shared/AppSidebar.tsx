'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, LogOut, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { getStoreType } from '@/lib/storeTypes';
import { useAuth } from '@/components/providers/AuthProvider';

type NavItem = {
  href: string;
  label: string;
  image?: string;
  badge?: string;
};

const navItems: NavItem[] = [
  { href: '/dashboard',    image: '/images/icons/home.jpg', label: 'Dashboard' },
  { href: '/billing',      image: '/images/icons/billing.jpg', label: 'New Sale' },
  { href: '/inventory',    image: '/images/icons/stock.jpg', label: 'Inventory' },
  { href: '/customers',    image: '/images/icons/customers.jpg', label: 'Customers' },
  { href: '/reports',      image: '/images/icons/icon_reports.jpg', label: 'Reports' },
  { href: '/suppliers',    image: '/images/icons/suppliers.jpg', label: 'Suppliers' },
  { href: '/employees',    image: '/images/icons/team.jpg', label: 'Team' },
  { href: '/ai-assistant', image: '/images/retailbot.jpg', label: 'AI Assistant', badge: 'AI' },
  { href: '/settings',     image: '/images/icons/settings.jpg', label: 'Settings' },
  { href: 'mailto:support@retailos.in', image: '/images/icons/icon_contact.jpg', label: 'Contact Us' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [storeName, setStoreName] = useState('Your Store');
  const [storeType, setStoreType] = useState('');
  const [storeIcon, setStoreIcon] = useState('Store');
  const [storeImage, setStoreImage] = useState('/images/icons/home.jpg');

  useEffect(() => {
    try {
      const profile = JSON.parse(localStorage.getItem('retailos_profile') || '{}');
      if (profile.storeName) setStoreName(profile.storeName);
      if (profile.storeType) {
        const type = getStoreType(profile.storeType);
        setStoreType(type.name);
        setStoreIcon(type.iconName);
        if (type.image) setStoreImage(type.image);
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
        animate={{ x: sidebarOpen ? 0 : -350 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed left-0 top-0 h-full w-[300px] z-50 lg:translate-x-0 lg:static lg:block flex flex-col bg-white border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-slate-50 flex-shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
              <img src="/images/logo.jpg" alt="RetailOS Logo" className="w-[120%] h-[120%] object-cover" />
            </div>
            <div>
              <div className="text-slate-800 font-black text-xl tracking-tight leading-none mb-1">RetailOS</div>
              <div className="text-orange-500 text-[10px] font-black tracking-widest uppercase">BUSINESS OS</div>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Store info */}
        <div className="p-4 border-b border-slate-50 flex-shrink-0 bg-white">
          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm overflow-hidden bg-slate-50 p-0.5">
                <img src={storeImage} alt="Store" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 text-[15px] font-bold leading-tight truncate">{storeName}</p>
                <p className="text-slate-500 font-medium text-[12px] mt-0.5 truncate">{storeType || 'General Store'}</p>
              </div>
            </div>
            <ChevronDown className="text-slate-400 group-hover:text-slate-600 transition-colors" size={18} />
          </div>
        </div>

        {/* Status Indicator */}
        <div className="px-5 py-3.5 border-b border-slate-50 bg-white flex items-center gap-2.5 flex-shrink-0">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <span className="text-emerald-600 text-[11px] font-bold tracking-widest uppercase">System Live</span>
        </div>

        {/* Nav items Grid */}
        <nav className="p-5 overflow-y-auto flex-1 custom-scrollbar bg-[#fcfcfc]">
          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-4 mt-1">MAIN MENU</p>
          <div className="grid grid-cols-2 gap-3">
            {navItems.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href}
                  onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}>
                  <motion.div
                    whileTap={{ scale: 0.96 }}
                    className={cn(
                      'relative flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-300 group overflow-hidden border',
                      isActive
                        ? 'bg-[#fff9f0] border-orange-200 text-slate-800 shadow-sm'
                        : 'bg-white border-slate-100 text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-slate-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]'
                    )}
                  >
                    {item.badge && (
                      <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-md font-black tracking-widest uppercase bg-orange-100 text-orange-600 z-10 shadow-sm">
                        {item.badge}
                      </span>
                    )}
                    {item.image && (
                      <div className="w-12 h-12 mb-3 relative">
                        <img 
                          src={item.image} 
                          alt={item.label} 
                          className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300" 
                        />
                      </div>
                    )}
                    <span className="text-[12px] font-bold tracking-tight z-10 text-center leading-tight">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom: logout & tag */}
        <div className="p-5 border-t border-slate-100 flex-shrink-0 flex flex-col gap-5 bg-white">
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl text-slate-700 font-bold bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-[13px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98]">
            <LogOut size={16} className="text-slate-400" />
            Secure Logout
          </button>
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              MADE IN INDIA 🇮🇳
            </span>
          </div>
        </div>
      </motion.aside>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
        }
      `}} />
    </>
  );
}

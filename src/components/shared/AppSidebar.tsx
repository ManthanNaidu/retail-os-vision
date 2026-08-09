'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart3,
  Truck, Users2, Sparkles, Settings, X, TrendingUp, Bell
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/billing', icon: ShoppingCart, label: 'Billing' },
  { href: '/inventory', icon: Package, label: 'Inventory' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/suppliers', icon: Truck, label: 'Suppliers' },
  { href: '/employees', icon: Users2, label: 'Employees' },
  { href: '/ai-assistant', icon: Sparkles, label: 'AI Assistant' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();

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
        className="fixed left-0 top-0 h-full w-[260px] z-50 lg:translate-x-0 lg:static lg:block"
        style={{ background: 'var(--bg-sidebar)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">RetailOS</div>
              <div className="text-blue-300 text-[10px] font-medium tracking-wider">AI POWERED</div>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Business name */}
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Your Store</p>
          <p className="text-white text-sm font-semibold mt-0.5 leading-tight">Shree Ram Medical</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 status-live"></span>
            <span className="text-green-400 text-xs">Live</span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="p-3 space-y-0.5 overflow-y-auto flex-1">
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}>
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
                  {item.href === '/ai-assistant' && (
                    <span className="ml-auto text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded-full font-semibold">AI</span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom upgrade prompt */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-blue-500/15 rounded-xl p-3">
            <p className="text-white text-xs font-semibold">🚀 Grow your business</p>
            <p className="text-white/50 text-[11px] mt-0.5">AI insights are working for you 24/7</p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

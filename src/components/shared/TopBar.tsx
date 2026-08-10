'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { notifications, unreadCount, toggleSidebar, markNotificationRead, markAllRead } = useAppStore();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const initial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

  // Trial days remaining
  const [trialDays, setTrialDays] = useState<number | null>(null);
  useEffect(() => {
    // Trial days logic disabled due to async backend move
  }, []);

  const typeColors = {
    warning: { bg: '#fef3c7', text: '#92400e', icon: AlertTriangle },
    danger:  { bg: '#fee2e2', text: '#991b1b', icon: AlertTriangle },
    success: { bg: '#d1fae5', text: '#065f46', icon: CheckCircle },
    info:    { bg: '#dbeafe', text: '#1e40af', icon: Info },
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-white/40" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <Menu size={20} style={{ color: 'var(--text-primary)' }} />
          </button>
          {title && (
            <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
          )}
          {/* Trial warning */}
          {trialDays !== null && trialDays <= 7 && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full"
              style={{ background: trialDays <= 3 ? '#fee2e2' : '#fef3c7', color: trialDays <= 3 ? '#dc2626' : '#d97706' }}>
              <Clock size={10} /> {trialDays}d left
            </span>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 relative">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} style={{ color: 'var(--text-secondary)' }} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: 'var(--danger)' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                  className="absolute top-12 right-0 w-80 z-50 rounded-2xl shadow-xl overflow-hidden"
                  style={{ background: 'white', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <span className="font-semibold text-sm">Notifications</span>
                    <button onClick={markAllRead} className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(n => {
                      const meta = typeColors[n.type];
                      const IconComp = meta.icon;
                      return (
                        <motion.div
                          key={n.id}
                          whileHover={{ backgroundColor: '#f8fafc' }}
                          className={cn('flex gap-3 px-4 py-3 cursor-pointer border-b last:border-0 transition-colors', !n.isRead && 'bg-blue-50/50')}
                          style={{ borderColor: 'var(--border)' }}
                          onClick={() => markNotificationRead(n.id)}
                        >
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
                            <IconComp size={16} style={{ color: meta.text }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{formatTime(n.createdAt)}</p>
                          </div>
                          {!n.isRead && <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: 'var(--primary)' }} />}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}

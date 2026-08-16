'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { AppSidebar } from '@/components/ui/AppSidebar';
import { BottomNav } from '@/components/ui/BottomNav';
import { TopBar } from '@/components/ui/TopBar';
import { PhonePreview } from '@/components/ui/PhonePreview';
import { getGlobalAnnouncement } from '@/lib/licenseManager';
import { Megaphone, EyeOff } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/billing':      'New Sale',
  '/inventory':    'Inventory',
  '/customers':    'Customers',
  '/reports':      'Reports',
  '/suppliers':    'Suppliers',
  '/employees':    'Team',
  '/ai-assistant': 'AI Assistant',
  '/settings':     'Settings',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'RetailOS AI';

  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [impersonatedName, setImpersonatedName] = useState<string | null>(null);

  useEffect(() => {
    async function loadGlobals() {
      const msg = await getGlobalAnnouncement();
      setAnnouncement(msg);
    }
    loadGlobals();

    if (typeof window !== 'undefined') {
      const imp = localStorage.getItem('impersonatedStore');
      const impName = localStorage.getItem('impersonatedStoreName');
      if (imp) {
        setImpersonating(imp);
        setImpersonatedName(impName);
      }
    }
  }, []);

  const handleExitImpersonation = () => {
    localStorage.removeItem('impersonatedStore');
    localStorage.removeItem('impersonatedStoreName');
    window.location.href = '/admin';
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-warm)' }}>
        {/* Banners */}
        {impersonating && (
          <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-3 text-sm font-bold z-[100] relative shadow-md shrink-0">
            <span>You are currently viewing data as: {impersonatedName || impersonating} (Impersonation Mode)</span>
            <button onClick={handleExitImpersonation} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors">
              <EyeOff size={14} /> Exit
            </button>
          </div>
        )}
        {announcement && (
          <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium z-50 shrink-0 shadow-sm relative">
            <Megaphone size={16} className="shrink-0" />
            <span>{announcement}</span>
          </div>
        )}

      <div className="flex flex-1 overflow-hidden relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar overlay */}
      <div className="lg:hidden">
        <AppSidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {pathname !== '/dashboard' && pathname !== '/inventory' && pathname !== '/customers' && pathname !== '/ai-assistant' && pathname !== '/employees' && pathname !== '/suppliers' && pathname !== '/settings' && <TopBar title={title} />}
        <main className="flex-1 overflow-y-auto has-bottom-nav lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* Desktop phone preview button */}
      <PhonePreview />
      </div>
    </div>
    </ProtectedRoute>
  );
}

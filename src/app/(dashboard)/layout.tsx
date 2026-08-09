'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { BottomNav } from '@/components/shared/BottomNav';
import { TopBar } from '@/components/shared/TopBar';
import { PhonePreview } from '@/components/shared/PhonePreview';

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
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Auth check: must be logged in to access dashboard routes
    try {
      const auth = JSON.parse(sessionStorage.getItem('retailos_auth') || '{}');
      if (!auth.loggedIn) {
        router.replace('/login');
        return;
      }
    } catch {
      router.replace('/login');
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-warm)' }}>
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--primary-light)', borderTopColor: 'var(--primary)' }} />
      </div>
    );
  }

  const title = pageTitles[pathname] || 'RetailOS AI';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-warm)' }}>
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
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto has-bottom-nav lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* Desktop phone preview button */}
      <PhonePreview />
    </div>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
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
  const pathname = usePathname();

  const title = pageTitles[pathname] || 'RetailOS AI';

  return (
    <ProtectedRoute>
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
        {pathname !== '/dashboard' && <TopBar title={title} />}
        <main className="flex-1 overflow-y-auto has-bottom-nav lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* Desktop phone preview button */}
      <PhonePreview />
    </div>
    </ProtectedRoute>
  );
}

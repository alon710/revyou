'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessProvider } from '@/contexts/BusinessContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { Loading } from '@/components/ui/loading';
import { Logo } from '@/components/ui/Logo';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?from=' + encodeURIComponent(window.location.pathname));
    }
  }, [user, loading, router]);

  
  if (loading) {
    return <Loading fullScreen />;
  }

  
  if (!user) {
    return null;
  }

  return (
    <BusinessProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 md:block">
          <Sidebar />
        </aside>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <MobileMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          
          {/* Mobile Header - Only visible on mobile */}
          <header className="flex items-center justify-between gap-4 border-b bg-white px-4 py-3 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Logo href='businesses' />
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
            {children}
          </main>
        </div>
      </div>
    </BusinessProvider>
  );
}

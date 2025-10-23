'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { BusinessToggler } from '@/components/dashboard/BusinessToggler';
import { signOut } from '@/lib/firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Logo } from '@/components/ui/Logo';
import { Loading } from '@/components/ui/loading';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { navItems } from './nav-items';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="flex h-full flex-col border-s bg-background" dir="rtl">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center justify-center border-b px-6">
        <Logo href="/businesses" textClassName="text-lg" />
      </div>

      {/* Business Toggler */}
      <BusinessToggler />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const href = user ? item.href(user.uid, currentBusiness?.id) : '#';
            const isActive = pathname === href || pathname.startsWith(href);
            const isDisabled = item.requiresBusiness && !currentBusiness;

            return (
              <Link
                key={item.title}
                href={isDisabled ? '#' : href}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive && !isDisabled
                    ? 'bg-primary text-primary-foreground'
                    : isDisabled
                    ? 'text-muted-foreground/50 cursor-not-allowed'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={(e) => {
                  if (isDisabled) e.preventDefault();
                }}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Profile Section */}
      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
            <AvatarFallback>
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">
              {user?.displayName || 'משתמש'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span>התנתק</span>
        </Button>
      </div>
    </div>
  );
}

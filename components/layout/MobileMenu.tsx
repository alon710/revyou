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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Building2,
  MessageSquare,
  Settings,
  Sliders,
  CreditCard,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavItem {
  title: string;
  href: (userId: string, businessId?: string) => string;
  icon: React.ComponentType<{ className?: string }>;
  requiresBusiness: boolean;
}

const navItems: NavItem[] = [
  {
    title: 'עסקים',
    href: () => '/businesses',
    icon: Building2,
    requiresBusiness: false,
  },
  {
    title: 'ביקורות',
    href: (userId, businessId) => businessId ? `/dashboard/${userId}/${businessId}/reviews` : '/businesses',
    icon: MessageSquare,
    requiresBusiness: true,
  },
  {
    title: 'תצורת עסק',
    href: (userId, businessId) => businessId ? `/dashboard/${userId}/${businessId}/configuration` : '/businesses',
    icon: Sliders,
    requiresBusiness: true,
  },
  {
    title: 'הגדרות חשבון',
    href: (userId) => `/dashboard/${userId}/settings`,
    icon: Settings,
    requiresBusiness: false,
  },
  {
    title: 'חיוב',
    href: () => '/billing',
    icon: CreditCard,
    requiresBusiness: false,
  },
];

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    onOpenChange(false);
  };

  const handleNavClick = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[280px] p-0">
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <SheetHeader className="border-b p-6">
            <SheetTitle className="text-right">
              <Link
                href="/businesses"
                className="flex items-center justify-end gap-2 font-bold text-lg"
                onClick={handleNavClick}
              >
                <span>ביקורות AI</span>
                <Sparkles className="h-6 w-6 text-primary" />
              </Link>
            </SheetTitle>
          </SheetHeader>

          {/* Business Toggler */}
          <BusinessToggler />

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const href = user ? item.href(user.uid, currentBusiness?.id) : '#';
              const isActive = pathname === href || pathname.startsWith(href);
              const isDisabled = item.requiresBusiness && !currentBusiness;

              return (
                <Link
                  key={item.title}
                  href={isDisabled ? '#' : href}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                    } else {
                      handleNavClick();
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive && !isDisabled
                      ? 'bg-primary text-primary-foreground'
                      : isDisabled
                      ? 'text-muted-foreground/50 cursor-not-allowed'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

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
      </SheetContent>
    </Sheet>
  );
}

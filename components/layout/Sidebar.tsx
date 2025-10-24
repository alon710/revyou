"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { BusinessToggler } from "@/components/dashboard/BusinessToggler";
import { signOut } from "@/lib/firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Logo } from "@/components/ui/Logo";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { navItems } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="flex h-full flex-col bg-background" dir="rtl">
      {/* Logo/Brand */}
      <div className="flex h-14 shrink-0 items-center justify-center border-b px-6">
        <Logo href="/businesses" textClassName="text-base font-semibold" />
      </div>

      {/* Business Toggler */}
      <div className="shrink-0 border-b px-4 py-3">
        <BusinessToggler />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const href = item.href;
            const isActive = pathname === href || pathname.startsWith(href);
            const isDisabled = item.requiresBusiness && !currentBusiness;

            return (
              <Link
                key={item.title}
                href={isDisabled ? "#" : href}
                className={cn(
                  "group relative flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive && !isDisabled
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : isDisabled
                      ? "text-muted-foreground/30 cursor-not-allowed opacity-50"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
                onClick={(e) => {
                  if (isDisabled) e.preventDefault();
                }}
              >
                {isActive && !isDisabled && (
                  <span className="absolute right-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-l-full bg-primary" />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-right">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Profile Section */}
      <div className="shrink-0 border-t p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
          <Avatar className="h-8 w-8 shrink-0 border">
            <AvatarImage
              src={user?.photoURL || undefined}
              alt={user?.displayName || "User"}
            />
            <AvatarFallback className="bg-muted text-xs font-medium">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden text-right">
            <p className="truncate text-sm font-medium leading-none">
              {user?.displayName || "משתמש"}
            </p>
            <p className="truncate text-xs text-muted-foreground mt-1">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span>התנתק</span>
        </Button>
      </div>
    </div>
  );
}

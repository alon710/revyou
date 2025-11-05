"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { landingNavItems, getIsActive } from "@/lib/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function LandingNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        <Logo href="/" />

        <div className="hidden md:flex items-center gap-6">
          {landingNavItems.map((item) => {
            const isActive = getIsActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Button asChild>
              <Link href="/dashboard">החשבון שלי</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/login">התחברות</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}

"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { signOut } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";
import { navItems } from "../nav-items";
import { BusinessToggler } from "@/components/dashboard/BusinessToggler";
import { NavbarContainer } from "./shared/NavbarContainer";
import { MobileMenuButton } from "./shared/MobileMenuButton";
import { MobileMenuSheet } from "./shared/MobileMenuSheet";

export function DashboardNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <NavbarContainer>
        <Logo href="/businesses" />

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href);

            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded-md",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/80 hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <BusinessToggler />
          <Button variant="destructive" onClick={handleSignOut}>
            התנתק
          </Button>
        </div>

        <MobileMenuButton
          isOpen={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
      </NavbarContainer>

      <MobileMenuSheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <div className="pb-2 border-b">
          <BusinessToggler />
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link
              key={item.title}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/80 hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}

        <div className="pt-2 border-t mt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleSignOut}
          >
            התנתק
          </Button>
        </div>
      </MobileMenuSheet>
    </>
  );
}

"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { navItems } from "../nav-items";
import { BusinessToggler } from "@/components/dashboard/BusinessToggler";
import { NavbarContainer } from "./shared/NavbarContainer";
import { MobileMenuButton } from "./shared/MobileMenuButton";
import { MobileMenuSheet } from "./shared/MobileMenuSheet";
import { Settings } from "lucide-react";

export function DashboardNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <NavbarContainer scrollSelector="main">
        <Logo href="/businesses" />

        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href);

            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-all px-3 py-2 rounded-lg",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-foreground/80 hover:text-foreground hover:bg-accent/50"
                )}
              >
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <BusinessToggler />
          <Button size="sm" variant="outline" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <MobileMenuButton
          isOpen={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
      </NavbarContainer>

      <MobileMenuSheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <div className="pb-3 border-b border-border/40">
          <BusinessToggler />
        </div>

        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link
              key={item.title}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-foreground/80 hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <span>{item.title}</span>
            </Link>
          );
        })}

        <div className="pt-3 border-t border-border/40 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            asChild
          >
            <Link href="/settings" onClick={handleNavClick}>
              <Settings className="h-4 w-4 mr-2" />
              הגדרות חשבון
            </Link>
          </Button>
        </div>
      </MobileMenuSheet>
    </>
  );
}

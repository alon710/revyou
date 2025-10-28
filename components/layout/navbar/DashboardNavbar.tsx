"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { IconButton } from "@/components/ui/icon-button";
import { Logo } from "@/components/ui/Logo";
import { navItems } from "@/components/layout/navbar/shared/nav-items";
import { LocationToggler } from "@/components/dashboard/LocationToggler";
import { NavbarContainer } from "@/components/layout/navbar/shared/NavbarContainer";
import { MobileMenuButton } from "@/components/layout/navbar/shared/MobileMenuButton";
import { MobileMenu } from "@/components/layout/navbar/shared/MobileMenu";
import { Settings, LogOut } from "lucide-react";
import { signOut } from "@/lib/firebase/auth";

function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href;
}

const SettingsButton = () => {
  const router = useRouter();

  return (
    <IconButton
      icon={Settings}
      aria-label="הגדרות"
      size="sm"
      onClick={() => router.push("/settings")}
    />
  );
};

const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Sign out failed:", error);
      return;
    }
    router.push("/");
  };

  return (
    <IconButton
      icon={LogOut}
      aria-label="התנתק"
      size="sm"
      onClick={handleSignOut}
    />
  );
};

export function DashboardNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <NavbarContainer scrollSelector="main">
        <div className="flex-shrink-0 pl-2">
          <Logo href="/locations" />
        </div>

        <nav className="hidden md:flex items-center flex-1 justify-center h-full gap-2">
          {navItems.map((item) => {
            const isActive = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-all px-3 py-2 rounded-lg cursor-pointer ${
                  isActive
                    ? "text-gray-900 opacity-100 font-semibold"
                    : "text-gray-600 opacity-60 hover:text-gray-900/90 hover:opacity-100"
                }`}
              >
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3 flex-shrink-0 pr-2">
          <LocationToggler />
          <SettingsButton />
          <SignOutButton />
        </div>

        <div className="flex md:hidden items-center gap-2">
          <LocationToggler />
          <SettingsButton />
          <SignOutButton />
          <MobileMenuButton
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </div>
      </NavbarContainer>

      <MobileMenu
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        items={navItems.map((item) => ({
          type: "link",
          href: item.href,
          label: item.title,
        }))}
      />
    </>
  );
}

"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { NavbarContainer } from "./NavbarContainer";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { LogOut } from "lucide-react";
import { LocationToggler } from "@/components/dashboard/utils/LocationToggler";
import { useNavigation } from "@/hooks/useNavigation";

export function UnifiedNavbar({
  variant,
}: {
  variant: "landing" | "dashboard";
}) {
  const {
    user,
    navItems,
    handleSignOut,
    scrollToSection,
    isActive,
  } = useNavigation(variant);

  return (
    <NavbarContainer>
      <div className="shrink-0 pl-2">
        <Logo href={user ? "/dashboard/locations" : "/"} />
      </div>

      <nav className="hidden md:flex items-center flex-1 justify-center h-full gap-1">
        {navItems.map((item) => {
          const isItemActive = isActive(item.href);

          if (variant === "landing" && item.href.startsWith("/#")) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => scrollToSection(item.href)}
                className={`text-sm font-medium px-4 py-2 rounded-lg ${
                  isItemActive
                    ? "text-gray-900 font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.label}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm font-medium px-4 py-2 rounded-lg ${
                isItemActive
                  ? "text-gray-900 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 shrink-0 pr-2">
        {user ? (
          <>
            {variant === "dashboard" && <LocationToggler />}
            {variant === "landing" && (
              <Link href="/dashboard/locations">
                <Button size="sm">החשבון שלי</Button>
              </Link>
            )}
            <IconButton
              icon={LogOut}
              aria-label="התנתק"
              size="sm"
              onClick={handleSignOut}
            />
          </>
        ) : (
          <Link href="/login">
            <Button size="sm">התחברות</Button>
          </Link>
        )}
      </div>
    </NavbarContainer>
  );
}

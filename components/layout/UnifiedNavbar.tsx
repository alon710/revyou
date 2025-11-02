"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { NavbarContainer } from "./NavbarContainer";
import { BusinessToggler } from "@/components/dashboard/utils/BusinessToggler";
import { useNavigation } from "@/hooks/useNavigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { getUserBusinesses } from "@/lib/firebase/business";
import { Business } from "@/types/database";
import { useUIStore } from "@/lib/store/ui-store";
import { extractBusinessIdFromPathname } from "@/lib/navigation";

export function UnifiedNavbar({
  variant,
}: {
  variant: "landing" | "dashboard";
}) {
  const { user, navItems, scrollToSection, isActive } = useNavigation(variant);
  const pathname = usePathname();
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    async function loadBusinesses() {
      if (!user || variant !== "dashboard") return;

      try {
        const fetchedBusinesses = await getUserBusinesses(user.uid);
        setBusinesses(fetchedBusinesses);
      } catch (error) {
        console.error("Error loading businesses:", error);
      }
    }

    loadBusinesses();
  }, [user, variant]);

  const selectedBusinessId = useUIStore(
    (state) => state.lastSelectedBusinessId
  );
  const urlBusinessId = extractBusinessIdFromPathname(pathname);
  const currentBusinessId = selectedBusinessId || urlBusinessId;

  return (
    <NavbarContainer>
      <div className="shrink-0 pl-2">
        <Logo href={user ? "/dashboard" : "/"} />
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
        {variant === "dashboard" && user && (
          <BusinessToggler
            businesses={businesses}
            currentBusinessId={currentBusinessId}
          />
        )}
        <AuthButton showAccountButton={variant === "landing"} />
      </div>
    </NavbarContainer>
  );
}

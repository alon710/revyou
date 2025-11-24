"use client";

import { Link } from "@/i18n/routing";
import { Logo } from "@/components/ui/Logo";
import { NavbarContainer } from "./NavbarContainer";
import { useNavigation } from "@/hooks/use-navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { useTranslations } from "next-intl";

export function UnifiedNavbar({ variant }: { variant: "landing" | "dashboard" }) {
  const { navItems, scrollToSection, isActive } = useNavigation(variant);
  const t = useTranslations();

  return (
    <NavbarContainer>
      <div className="shrink-0 ps-2">
        <Logo href="/dashboard/home" />
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
                className={`text-sm font-medium px-4 py-2 rounded-lg cursor-pointer ${
                  isItemActive ? "text-gray-900 font-semibold" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {t(item.label)}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm font-medium px-4 py-2 rounded-lg cursor-pointer ${
                isItemActive ? "text-gray-900 font-semibold" : "text-gray-700 hover:text-gray-900"
              }`}
            >
              {t(item.label)}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 shrink-0 pe-2">
        <AuthButton />
      </div>
    </NavbarContainer>
  );
}

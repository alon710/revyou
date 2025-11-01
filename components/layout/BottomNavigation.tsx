"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { isAnchorLink } from "@/lib/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";

export function BottomNavigation() {
  const {
    user,
    variant,
    navItems,
    handleSignOut,
    scrollToSection,
    isActive: checkIsActive,
  } = useNavigation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg h-16">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = checkIsActive(item.href);
          const isAnchor = isAnchorLink(item.href);

          const content = (
            <>
              <Icon
                className={cn(
                  "transition-all",
                  isActive ? "w-6 h-6" : "w-5 h-5"
                )}
              />
              <span
                className={cn(
                  "text-xs transition-all",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </>
          );

          if (isAnchor) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => scrollToSection(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all",
                  isActive
                    ? "text-primary"
                    : "text-gray-600 hover:text-gray-900 active:scale-95"
                )}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all",
                isActive
                  ? "text-primary"
                  : "text-gray-600 hover:text-gray-900 active:scale-95"
              )}
            >
              {content}
            </Link>
          );
        })}

        {user && variant === "landing" && (
          <>
            <Link
              href="/dashboard/locations"
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all text-gray-600 hover:text-gray-900 active:scale-95"
            >
              <LayoutDashboard className="w-5 h-5 transition-all" />
              <span className="text-xs font-medium transition-all">
                החשבון שלי
              </span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all text-gray-600 hover:text-gray-900 active:scale-95"
            >
              <LogOut className="w-5 h-5 transition-all" />
              <span className="text-xs font-medium transition-all">התנתק</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

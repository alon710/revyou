"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  dashboardNavItems,
  landingNavItems,
  getNavigationVariant,
  getIsActive,
  isAnchorLink,
} from "@/lib/navigation";
import { useEffect, useState } from "react";

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [hash, setHash] = useState("");
  const variant = getNavigationVariant(pathname);
  const navItems = variant === "dashboard" ? dashboardNavItems : landingNavItems;

  useEffect(() => {
    // Update hash on client side
    setHash(window.location.hash);

    const handleHashChange = () => {
      setHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleAnchorClick = (href: string) => {
    const anchorHash = href.substring(1); // Remove leading '/'

    if (pathname === "/") {
      // Already on homepage - just scroll and update hash
      setHash(anchorHash);
      document
        .getElementById(anchorHash.replace("#", ""))
        ?.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", href);
    } else {
      // Navigate to homepage with hash
      router.push(href);
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg h-16">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(pathname, item.href, hash);
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
                onClick={() => handleAnchorClick(item.href)}
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
      </div>
    </nav>
  );
}

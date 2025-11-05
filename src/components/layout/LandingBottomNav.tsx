"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { landingNavItems, getIsActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function LandingBottomNav() {
  const pathname = usePathname();

  if (!pathname.startsWith("/") || pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex items-center justify-around h-16">
        {landingNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

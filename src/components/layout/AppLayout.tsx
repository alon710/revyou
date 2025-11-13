"use client";

import { UnifiedNavbar } from "./UnifiedNavbar";
import { BottomNavigation } from "./BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function AppLayout({
  children,
  variant = "landing",
  className,
}: {
  children: React.ReactNode;
  variant?: "landing" | "dashboard";
  className?: string;
}) {
  const { user } = useAuth();
  const navVariant = user && variant === "dashboard" ? "dashboard" : "landing";

  return (
    <div className="flex flex-col h-screen ">
      <UnifiedNavbar variant={navVariant} />
      <main
        className={cn(
          "flex-1 overflow-y-auto",
          variant === "dashboard"
            ? "px-4 md:px-6 lg:px-8 pt-6 pb-20 md:pb-6 bg-linear-to-br from-primary/20 via-white to-secondary/20"
            : "pb-16 md:pb-0",
          className
        )}
      >
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}

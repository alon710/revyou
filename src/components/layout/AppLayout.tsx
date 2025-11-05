"use client";

import { LandingNavbar } from "./LandingNavbar";
import { LandingBottomNav } from "./LandingBottomNav";
import { cn } from "@/lib/utils";

export function AppLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  variant?: "landing" | "dashboard";
  className?: string;
}) {
  // AppLayout is now only used for landing pages
  // Dashboard uses Sidebar layout directly in dashboard/layout.tsx
  return (
    <div className="flex flex-col h-screen">
      <LandingNavbar />
      <main className={cn("flex-1 overflow-y-auto pb-16 md:pb-0", className)}>
        {children}
      </main>
      <LandingBottomNav />
    </div>
  );
}

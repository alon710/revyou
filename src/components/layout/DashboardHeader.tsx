"use client";

import { Logo } from "@/components/ui/Logo";
import { IconButton } from "@/components/ui/icon-button";
import { Menu } from "lucide-react";
import { useSidebar } from "./Sidebar/Sidebar";

export function DashboardHeader() {
  const { isMobile, setIsOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-60 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex items-center justify-between gap-3 px-4 h-full">
          <Logo href="/dashboard" size="sm" />

          <IconButton
            icon={Menu}
            variant="ghost"
            onClick={() => setIsOpen(true)}
            aria-label="פתח תפריט"
            size="sm"
          />
        </div>
      ) : (
        /* Desktop Layout - Empty but maintains header space */
        <div className="flex items-center px-6 h-full" />
      )}
    </header>
  );
}

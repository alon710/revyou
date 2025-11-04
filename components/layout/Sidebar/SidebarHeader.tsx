"use client";

import { Logo } from "@/components/ui/Logo";
import { IconButton } from "@/components/ui/icon-button";
import { Menu, PanelLeftClose, PanelRightClose } from "lucide-react";
import { useSidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

export function SidebarHeader() {
  const { isCollapsed, toggleCollapsed, isMobile } = useSidebar();

  // Mobile: show menu trigger
  if (isMobile) {
    return (
      <div className="flex items-center justify-between p-4 border-b">
        <Logo href="/dashboard" />
      </div>
    );
  }

  // Desktop: show logo and collapse button
  return (
    <div
      className={cn(
        "flex items-center border-b transition-all h-14",
        isCollapsed ? "justify-center px-3" : "justify-between px-4"
      )}
    >
      {!isCollapsed && <Logo href="/dashboard" />}

      <IconButton
        icon={isCollapsed ? PanelRightClose : PanelLeftClose}
        variant="ghost"
        size="sm"
        onClick={toggleCollapsed}
        aria-label={isCollapsed ? "הרחב תפריט" : "צמצם תפריט"}
        className="rtl:rotate-180"
      />
    </div>
  );
}

// Mobile trigger button (to be placed in layout)
export function SidebarMobileTrigger() {
  const { setIsOpen, isMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <IconButton
      icon={Menu}
      variant="ghost"
      onClick={() => setIsOpen(true)}
      aria-label="פתח תפריט"
      className="fixed top-4 right-4 z-50 rtl:right-4 rtl:left-auto ltr:left-4 ltr:right-auto"
    />
  );
}

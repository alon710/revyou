"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarAccountBusinessSelector } from "./SidebarAccountBusinessSelector";
import { SidebarNav } from "./SidebarNav";
import { SidebarFooter } from "./SidebarFooter";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProviderProps {
  children: React.ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Lazy initialization from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebar-collapsed");
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Detect mobile/tablet screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-collapse on laptop screens
      if (window.innerWidth < 1280 && window.innerWidth >= 768) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleCollapsed = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newValue));
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapsed,
        isMobile,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function Sidebar() {
  const { isCollapsed, isMobile, isOpen, setIsOpen } = useSidebar();

  // Mobile: render as Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-[280px] p-0 rtl:right-0 rtl:left-auto"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>תפריט ניווט</SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: render as fixed sidebar
  return (
    <aside
      className={cn(
        "fixed top-0 right-0 h-screen border-l bg-sidebar transition-all duration-300 z-40",
        "rtl:right-0 rtl:border-l ltr:left-0 ltr:border-r",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent />
    </aside>
  );
}

function SidebarContent() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader />

      {!isCollapsed && (
        <div className="px-3 py-2">
          <SidebarAccountBusinessSelector />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <SidebarNav />
      </div>

      <SidebarFooter />
    </div>
  );
}

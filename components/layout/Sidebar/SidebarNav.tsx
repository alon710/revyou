"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavItems } from "@/lib/navigation";
import { getIsActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./Sidebar";

export function SidebarNav() {
  const pathname = usePathname();
  const { isCollapsed, isMobile, setIsOpen } = useSidebar();

  const handleItemClick = () => {
    // Close mobile sidebar after navigation
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <nav className="space-y-1 px-2 py-4">
      {dashboardNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = getIsActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleItemClick}
            className={cn(
              "flex items-center justify-between w-full rounded-lg transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground",
              isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-2.5"
            )}
          >
            {isCollapsed ? (
              // Collapsed: icon only, centered
              <Icon className="h-5 w-5" />
            ) : (
              // Expanded: text right, icon left, space-between
              <>
                <span className="text-sm text-right">{item.label}</span>
                <Icon className="h-5 w-5 shrink-0" />
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

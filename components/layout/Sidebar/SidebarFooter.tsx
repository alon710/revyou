"use client";

import { SidebarUserMenu } from "./SidebarUserMenu";
import { SidebarUpgradeItem } from "./SidebarUpgradeItem";
import { useSidebar } from "./Sidebar";

export function SidebarFooter() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="border-t mt-auto">
      {!isCollapsed && (
        <div className="p-3 pb-0">
          <SidebarUpgradeItem />
        </div>
      )}

      <div className="p-3">
        <SidebarUserMenu />
      </div>
    </div>
  );
}

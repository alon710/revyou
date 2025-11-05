"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AccountProvider } from "@/contexts/AccountContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import {
  SidebarProvider,
  Sidebar,
  useSidebar,
} from "@/components/layout/Sidebar/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Loading } from "@/components/ui/loading";
import { cn } from "@/lib/utils";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobile } = useSidebar();

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <div className={cn(!isMobile && (isCollapsed ? "mr-16" : "mr-64"))}>
          <DashboardHeader />
        </div>

        <main
          className={cn(
            "flex-1 overflow-y-auto",
            "px-4 md:px-6 lg:px-8 pt-6 pb-6",
            "bg-gradient-to-br from-primary/20 via-white to-secondary/20",
            // Account for sidebar width on desktop - dynamic based on collapsed state
            !isMobile && (isCollapsed ? "mr-16" : "mr-64")
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <AccountProvider>
      <BusinessProvider>
        <SidebarProvider>
          <DashboardContent>{children}</DashboardContent>
        </SidebarProvider>
      </BusinessProvider>
    </AccountProvider>
  );
}

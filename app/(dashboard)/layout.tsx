"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { DashboardNavbar } from "@/components/layout/navbar/DashboardNavbar";
import { Loading } from "@/components/ui/loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <BusinessProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        {/* Top Navigation Bar */}
        <DashboardNavbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30 pt-24 md:pt-28 px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8">
          {children}
        </main>
      </div>
    </BusinessProvider>
  );
}

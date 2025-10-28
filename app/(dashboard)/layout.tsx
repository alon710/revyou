"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { DashboardNavbar } from "@/components/layout/navbar/DashboardNavbar";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";
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
    <LocationProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-primary/20 via-white to-secondary/20">
        <DashboardNavbar />

        <main className="flex-1 overflow-y-auto bg-transparent pt-24 md:pt-28 px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8">
          {children}
        </main>

        <UpgradeBanner />
      </div>
    </LocationProvider>
  );
}

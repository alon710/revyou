"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { UpgradeBanner } from "@/components/dashboard/utils/UpgradeBanner";
import { Loading } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
    <BusinessProvider>
      <AppLayout variant="dashboard">
        <ErrorBoundary>
          {children}
          <UpgradeBanner />
        </ErrorBoundary>
      </AppLayout>
    </BusinessProvider>
  );
}

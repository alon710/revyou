"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { UpgradeBanner } from "@/components/dashboard/utils/UpgradeBanner";
import { Loading } from "@/components/ui/loading";
import { useRouter, usePathname } from "@/i18n/routing";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout variant="dashboard">
      {children}
      <UpgradeBanner />
    </AppLayout>
  );
}

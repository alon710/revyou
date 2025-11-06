"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getUser } from "@/lib/firebase/users";
import { AppLayout } from "@/components/layout/AppLayout";
import { UpgradeBanner } from "@/components/dashboard/utils/UpgradeBanner";
import { Loading } from "@/components/ui/loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (!loading && !user) {
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      if (!loading && user) {
        try {
          const userData = await getUser(user.uid);

          // Check if onboarding is completed
          if (!userData?.onboardingCompleted) {
            router.push("/onboarding/step-1");
            return;
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
        } finally {
          setCheckingOnboarding(false);
        }
      }
    }

    checkAuth();
  }, [user, loading, router]);

  if (loading || checkingOnboarding) {
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

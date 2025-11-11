"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";
import { useRouter } from "@/i18n/routing";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard/home");
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading fullScreen />;
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");

  useEffect(() => {
    if (!loading && !user) {
      const search = searchParams.toString();
      const currentUrl = search ? `${pathname}?${search}` : pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [user, loading, router, pathname, searchParams]);

  if (loading) {
    return <Loading fullScreen text={t("checkingAuth")} />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { AccountWithBusinesses } from "@/lib/types";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import { AccountBusinessesList } from "@/components/dashboard/home/AccountBusinessesList";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("dashboard.home");
  const [accountsWithBusinesses, setAccountsWithBusinesses] = useState<AccountWithBusinesses[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        setLoading(true);

        const response = await fetch(`/api/users/${user.uid}/accounts-with-businesses`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch accounts with businesses");
        }
        const data = await response.json();
        setAccountsWithBusinesses(data.accounts || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && user) {
      fetchData();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <Loading size="md" fullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />
      <AccountBusinessesList accounts={accountsWithBusinesses} />
    </PageContainer>
  );
}

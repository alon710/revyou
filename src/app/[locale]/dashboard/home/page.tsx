"use client";

import { useState, useEffect } from "react";
import type { AccountWithBusinesses } from "@/lib/types";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import { AccountBusinessesList } from "@/components/dashboard/home/AccountBusinessesList";
import { useTranslations } from "next-intl";
import { getAccountsWithBusinesses } from "@/lib/actions/accounts.actions";

export default function HomePage() {
  const t = useTranslations("dashboard.home");
  const [accountsWithBusinesses, setAccountsWithBusinesses] = useState<AccountWithBusinesses[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const accounts = await getAccountsWithBusinesses();
        setAccountsWithBusinesses(accounts);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <Loading size="md" fullScreen />;
  }

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />
      <AccountBusinessesList accounts={accountsWithBusinesses} />
    </PageContainer>
  );
}

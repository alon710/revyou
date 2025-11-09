"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Account, AccountWithBusinesses } from "@/lib/types";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import { AccountBusinessesList } from "@/components/dashboard/home/AccountBusinessesList";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [accountsWithBusinesses, setAccountsWithBusinesses] = useState<AccountWithBusinesses[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        setLoading(true);

        const accountsResponse = await fetch(`/api/users/${user.uid}/accounts`);
        if (!accountsResponse.ok) {
          throw new Error("Failed to fetch accounts");
        }
        const accountsData = await accountsResponse.json();
        const accounts: Account[] = accountsData.accounts || [];

        const accountsWithBusinessesPromises = accounts.map(async (account) => {
          const businessesResponse = await fetch(`/api/users/${user.uid}/accounts/${account.id}/businesses`);
          if (!businessesResponse.ok) {
            console.error(`Failed to fetch businesses for account ${account.id}:`, businessesResponse.statusText);
            return { ...account, businesses: [] };
          }
          const businessesData = await businessesResponse.json();
          return { ...account, businesses: businessesData.businesses || [] };
        });

        const result = await Promise.all(accountsWithBusinessesPromises);
        setAccountsWithBusinesses(result);
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
      <PageHeader title="בית" description="נהל את החשבונות והעסקים שלך" />
      <AccountBusinessesList accounts={accountsWithBusinesses} />
    </PageContainer>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Account } from "@/lib/types";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import { useRouter } from "next/navigation";
import { Plus, Building2 } from "lucide-react";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";

export default function AccountsPage() {
  const { user, loading: authLoading } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchAccounts() {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/users/${user.uid}/accounts`);
        if (!response.ok) {
          throw new Error("Failed to fetch accounts");
        }
        const data = await response.json();
        setAccounts(data.accounts || []);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && user) {
      fetchAccounts();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <Loading size="md" fullScreen />;
  }

  if (!user) {
    return null;
  }

  const handleAccountClick = (account: Account) => {
    router.push(`/dashboard/accounts/${account.id}/businesses`);
  };

  return (
    <PageContainer>
      <PageHeader title="החשבונות שלי" description="בחר חשבון Google כדי לנהל את העסקים שלו" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <DashboardCard
            key={account.id}
            className="cursor-pointer hover:shadow-lg transition-shadow min-h-[320px] flex flex-col"
            onClick={() => handleAccountClick(account)}
          >
            <DashboardCardHeader>
              <DashboardCardTitle>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <span className="truncate">{account.accountName}</span>
                </div>
              </DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent>
              <div className="text-sm text-muted-foreground truncate">{account.email}</div>
            </DashboardCardContent>
          </DashboardCard>
        ))}
        <DashboardCard
          className="cursor-pointer border-dashed border-2 hover:border-primary/50 hover:bg-accent/50 transition-all flex flex-col items-center justify-center min-h-[320px]"
          onClick={() => router.push("/onboarding/connect-account")}
        >
          <div className="flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">חבר חשבון</h3>
            <p className="text-sm text-muted-foreground mt-2">חבר חשבון Google נוסף</p>
          </div>
        </DashboardCard>
      </div>
    </PageContainer>
  );
}

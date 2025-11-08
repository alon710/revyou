"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { useUserStats } from "@/hooks/useUserStats";
import { SubscriptionInfo } from "@/components/dashboard/dashboard/SubscriptionInfo";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";

export default function DashboardPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const {
    subscription,
    limits,
    planType,
    loading: subscriptionLoading,
  } = useSubscription();
  const { reviewCount, loading: reviewCountLoading } = useUserStats();
  const [businessesCount, setBusinessesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!authUser) return;

    try {
      setLoading(true);

      const accountsResponse = await fetch(
        `/api/users/${authUser.uid}/accounts`
      );
      if (!accountsResponse.ok) {
        throw new Error("Failed to fetch accounts");
      }
      const accountsData = await accountsResponse.json();

      let totalBusinesses = 0;
      for (const account of accountsData.accounts || []) {
        const businessesResponse = await fetch(
          `/api/users/${authUser.uid}/accounts/${account.id}/businesses`
        );
        if (businessesResponse.ok) {
          const businessesData = await businessesResponse.json();
          totalBusinesses += businessesData.businesses?.length || 0;
        }
      }
      setBusinessesCount(totalBusinesses);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authLoading && authUser) {
      loadData();
    }
  }, [authUser, authLoading, loadData]);

  if (authLoading || loading || subscriptionLoading || reviewCountLoading) {
    return <Loading size="md" fullScreen />;
  }

  if (!authUser) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader
        title="דף הבית"
        description="נהל את העסקים שלך והביקורות שלך"
      />

      <SubscriptionInfo
        limits={limits}
        subscription={subscription}
        currentBusiness={businessesCount}
        currentReviews={reviewCount}
        planType={planType}
      />
    </PageContainer>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUserBusinesses } from "@/lib/firebase/business";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { useUserStats } from "@/hooks/useUserStats";
import { getUser } from "@/lib/firebase/users";
import { User } from "@/types/database";
import { AccountInfo } from "@/components/dashboard/settings/AccountInfo";
import { SubscriptionInfo } from "@/components/dashboard/settings/SubscriptionInfo";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";

export default function DashboardPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const {
    subscription,
    limits,
    loading: subscriptionLoading,
  } = useSubscription();
  const { reviewCount, loading: reviewCountLoading } = useUserStats();
  const [userData, setUserData] = useState<User | null>(null);
  const [businessesCount, setBusinessesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      const [data, businesses] = await Promise.all([
        getUser(authUser.uid),
        getAllUserBusinesses(authUser.uid),
      ]);
      setUserData(data);
      setBusinessesCount(businesses.length);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authLoading && authUser) {
      loadUserData();
    }
  }, [authUser, authLoading, loadUserData]);

  if (authLoading || loading || subscriptionLoading || reviewCountLoading) {
    return <Loading size="md" fullScreen />;
  }

  if (!authUser || !userData) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader
        title="דף הבית"
        description="נהל את העסקים שלך והביקורות שלך"
      />

      <AccountInfo
        displayName={authUser.displayName}
        email={authUser.email}
        uid={authUser.uid}
      />

      <SubscriptionInfo
        limits={limits}
        subscription={subscription}
        currentBusiness={businessesCount}
        currentReviews={reviewCount}
      />
    </PageContainer>
  );
}

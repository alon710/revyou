"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { useUserStats } from "@/hooks/useUserStats";
import { getUser } from "@/lib/firebase/users";
import { User } from "@/types/database";
import { AccountInfo } from "@/components/dashboard/settings/AccountInfo";
import { SubscriptionInfo } from "@/components/dashboard/settings/SubscriptionInfo";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";

export default function SettingsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { businesses } = useBusiness();
  const {
    subscription,
    limits,
    loading: subscriptionLoading,
  } = useSubscription();
  const { reviewCount, loading: reviewCountLoading } = useUserStats();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      const data = await getUser(authUser.uid);
      setUserData(data);
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
    return (
      <div className="flex h-full items-center justify-center">
        <Loading size="md" />
      </div>
    );
  }

  if (!authUser || !userData) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader
        title="הגדרות חשבון"
        description="נהל את הגדרות החשבון והתראות האימייל שלך"
      />

      <AccountInfo
        displayName={authUser.displayName}
        email={authUser.email}
        uid={authUser.uid}
      />

      <SubscriptionInfo
        limits={limits}
        subscription={subscription}
        currentBusiness={businesses.length}
        currentReviews={reviewCount}
      />
    </PageContainer>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { getUser } from "@/lib/firebase/users";
import { getReviewCountThisMonth } from "@/lib/subscription/usage-stats";
import { User } from "@/types/database";
import { AccountInfo } from "@/components/dashboard/settings/AccountInfo";
import { SubscriptionInfo } from "@/components/dashboard/settings/SubscriptionInfo";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import { getUserBusinesses } from "@/lib/firebase/business";

export default function SettingsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const {
    subscription,
    limits,
    loading: subscriptionLoading,
  } = useSubscription();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);
  const [businessCount, setBusinessCount] = useState(0);

  const loadUserData = useCallback(async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      const data = await getUser(authUser.uid);
      setUserData(data);
      const count = await getReviewCountThisMonth();
      setReviewCount(count);

      const businesses = await getUserBusinesses(authUser.uid);
      const connected = businesses.filter((b) => b.connected);
      setBusinessCount(connected.length);
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

  if (authLoading || loading || subscriptionLoading) {
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
        currentBusiness={businessCount}
        currentReviews={reviewCount}
      />
    </PageContainer>
  );
}

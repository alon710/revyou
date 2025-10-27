"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { getUser } from "@/lib/firebase/users";
import { signOut } from "@/lib/firebase/auth";
import { getReviewCountThisMonth } from "@/lib/subscription/usage-stats";
import { User } from "@/types/database";
import { AccountInfo } from "@/components/dashboard/settings/AccountInfo";
import { SubscriptionInfo } from "@/components/dashboard/settings/SubscriptionInfo";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { locations } = useLocation();
  const {
    subscription,
    limits,
    loading: subscriptionLoading,
  } = useSubscription();
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);

  const loadUserData = useCallback(async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      const data = await getUser(authUser.uid);
      setUserData(data);
      const count = await getReviewCountThisMonth();
      setReviewCount(count);
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

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

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
        actions={
          <Button size="sm" variant="outline" onClick={handleSignOut}>
            התנתק
          </Button>
        }
      />

      <AccountInfo
        displayName={authUser.displayName}
        email={authUser.email}
        uid={authUser.uid}
      />

      <SubscriptionInfo
        limits={limits}
        subscription={subscription}
        currentLocations={locations.length}
        currentReviews={reviewCount}
      />
    </PageContainer>
  );
}

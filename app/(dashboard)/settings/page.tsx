"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { getUser, updateNotificationPreferences } from "@/lib/firebase/users";
import { signOut } from "@/lib/firebase/auth";
import { getReviewCountThisMonth } from "@/lib/subscription/usage";
import { User } from "@/types/database";
import { NotificationPreferences } from "@/components/dashboard/settings/NotificationPreferences";
import { AccountInfo } from "@/components/dashboard/settings/AccountInfo";
import { SubscriptionInfo } from "@/components/dashboard/settings/SubscriptionInfo";
import { useToast } from "@/hooks/use-toast";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { businesses } = useBusiness();
  const {
    subscription,
    planType,
    limits,
    loading: subscriptionLoading,
  } = useSubscription();
  const router = useRouter();
  const { toast } = useToast();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);

  const loadUserData = async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      const data = await getUser(authUser.uid);
      setUserData(data);

      // Load review count for usage stats
      const count = await getReviewCountThisMonth();
      setReviewCount(count);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את נתוני המשתמש",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && authUser) {
      loadUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, authLoading]);

  const handleUpdateNotifications = async (preferences: {
    emailOnNewReview: boolean;
  }) => {
    if (!authUser) return;

    try {
      await updateNotificationPreferences(authUser.uid, preferences);
      toast({
        title: "נשמר בהצלחה",
        description: "העדפות ההתראות עודכנו",
      });
      await loadUserData();
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את העדפות ההתראות",
        variant: "destructive",
      });
      throw error;
    }
  };

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
        currentBusinesses={businesses.length}
        currentReviews={reviewCount}
      />

      <NotificationPreferences
        emailOnNewReview={
          userData.notificationPreferences?.emailOnNewReview || false
        }
        loading={loading}
        onUpdate={handleUpdateNotifications}
      />
    </PageContainer>
  );
}

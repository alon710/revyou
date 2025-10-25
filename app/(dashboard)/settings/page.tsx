"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUser,
  updateNotificationPreferences,
  deleteUserAccount,
} from "@/lib/firebase/users";
import { User } from "@/types/database";
import { DangerZone } from "@/components/dashboard/settings/DangerZone";
import { NotificationPreferences } from "@/components/dashboard/settings/NotificationPreferences";
import { AccountInfo } from "@/components/dashboard/settings/AccountInfo";
import { useToast } from "@/hooks/use-toast";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";

export default function SettingsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      const data = await getUser(authUser.uid);
      setUserData(data);
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
    emailOnFailedPost: boolean;
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

  const handleDeleteAccount = async () => {
    if (!authUser) return;

    try {
      await deleteUserAccount(authUser.uid);
      toast({
        title: "החשבון נמחק",
        description: "החשבון שלך נמחק בהצלחה",
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את החשבון",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (authLoading || loading) {
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

      <NotificationPreferences
        emailOnNewReview={
          userData.notificationPreferences?.emailOnNewReview || false
        }
        emailOnFailedPost={
          userData.notificationPreferences?.emailOnFailedPost || false
        }
        loading={loading}
        onUpdate={handleUpdateNotifications}
      />

      <DangerZone
        userEmail={authUser.email || ""}
        onDeleteAccount={handleDeleteAccount}
      />
    </PageContainer>
  );
}

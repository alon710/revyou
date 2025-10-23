"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import {
  getUser,
  updateNotificationPreferences,
  deleteUserAccount,
} from "@/lib/firebase/users";
import { User } from "@/types/database";
import { DangerZone } from "@/components/dashboard/settings/DangerZone";
import { NotificationPreferences } from "@/components/dashboard/settings/NotificationPreferences";
import { useToast } from "@/hooks/use-toast";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";

export default function SettingsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [emailOnNewReview, setEmailOnNewReview] = useState(false);
  const [emailOnFailedPost, setEmailOnFailedPost] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (!authUser) return;

      if (params.userId !== authUser.uid) {
        router.push(`/dashboard/${authUser.uid}/settings`);
        return;
      }

      try {
        setLoading(true);
        const data = await getUser(authUser.uid);
        setUserData(data);

        if (data?.notificationPreferences) {
          setEmailOnNewReview(
            data.notificationPreferences.emailOnNewReview || false
          );
          setEmailOnFailedPost(
            data.notificationPreferences.emailOnFailedPost || false
          );
        }
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

    if (!authLoading && authUser) {
      loadUserData();
    }
  }, [authUser, authLoading, params.userId, router, toast]);

  const handleSaveNotifications = async () => {
    if (!authUser) return;

    setSaving(true);
    try {
      await updateNotificationPreferences(authUser.uid, {
        emailOnNewReview,
        emailOnFailedPost,
      });

      toast({
        title: "נשמר בהצלחה",
        description: "העדפות ההתראות עודכנו",
      });
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את העדפות ההתראות",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
    <PageContainer maxWidth="4xl">
      <PageHeader
        title="הגדרות חשבון"
        description="נהל את הגדרות החשבון והתראות האימייל שלך"
      />

      {/* Notification Preferences */}
      <NotificationPreferences
        emailOnNewReview={emailOnNewReview}
        emailOnFailedPost={emailOnFailedPost}
        onEmailOnNewReviewChange={setEmailOnNewReview}
        onEmailOnFailedPostChange={setEmailOnFailedPost}
        onSave={handleSaveNotifications}
        saving={saving}
      />

      {/* Danger Zone */}
      <DangerZone
        userEmail={authUser.email || ""}
        onDeleteAccount={handleDeleteAccount}
      />
    </PageContainer>
  );
}

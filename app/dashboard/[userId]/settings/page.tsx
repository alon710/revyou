'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { getUser, updateNotificationPreferences, deleteUserAccount } from '@/lib/firebase/users';
import { User } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, Save } from 'lucide-react';
import { DangerZone } from '@/components/dashboard/settings/DangerZone';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Notification preferences state
  const [emailOnNewReview, setEmailOnNewReview] = useState(false);
  const [emailOnFailedPost, setEmailOnFailedPost] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!authUser) return;

      // Verify userId matches auth user
      if (params.userId !== authUser.uid) {
        router.push(`/dashboard/${authUser.uid}/settings`);
        return;
      }

      try {
        setLoading(true);
        const data = await getUser(authUser.uid);
        setUserData(data);

        // Set notification preferences
        if (data?.notificationPreferences) {
          setEmailOnNewReview(data.notificationPreferences.emailOnNewReview || false);
          setEmailOnFailedPost(data.notificationPreferences.emailOnFailedPost || false);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לטעון את נתוני המשתמש',
          variant: 'destructive',
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
        title: 'נשמר בהצלחה',
        description: 'העדפות ההתראות עודכנו',
      });
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשמור את העדפות ההתראות',
        variant: 'destructive',
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
        title: 'החשבון נמחק',
        description: 'החשבון שלך נמחק בהצלחה',
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את החשבון',
        variant: 'destructive',
      });
      throw error;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authUser || !userData) {
    return null;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">הגדרות חשבון</h1>
          <p className="mt-2 text-muted-foreground">
            נהל את הגדרות החשבון והתראות האימייל שלך
          </p>
        </div>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>התראות אימייל</CardTitle>
            </div>
            <CardDescription>
              בחר אילו התראות תרצה לקבל באימייל
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email on New Review */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailOnNewReview">ביקורת חדשה</Label>
                <p className="text-xs text-muted-foreground">
                  קבל התראה באימייל כאשר מתקבלת ביקורת חדשה
                </p>
              </div>
              <Switch
                id="emailOnNewReview"
                checked={emailOnNewReview}
                onCheckedChange={setEmailOnNewReview}
                disabled={saving}
              />
            </div>

            {/* Email on Failed Post */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailOnFailedPost">פרסום נכשל</Label>
                <p className="text-xs text-muted-foreground">
                  קבל התראה באימייל כאשר פרסום תגובה אוטומטית נכשל
                </p>
              </div>
              <Switch
                id="emailOnFailedPost"
                checked={emailOnFailedPost}
                onCheckedChange={setEmailOnFailedPost}
                disabled={saving}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                שמור שינויים
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <DangerZone
          userEmail={authUser.email || ''}
          onDeleteAccount={handleDeleteAccount}
        />
      </div>
    </div>
  );
}

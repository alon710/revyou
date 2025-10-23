"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Save } from "lucide-react";

interface NotificationPreferencesProps {
  emailOnNewReview: boolean;
  emailOnFailedPost: boolean;
  onEmailOnNewReviewChange: (value: boolean) => void;
  onEmailOnFailedPostChange: (value: boolean) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

export function NotificationPreferences({
  emailOnNewReview,
  emailOnFailedPost,
  onEmailOnNewReviewChange,
  onEmailOnFailedPostChange,
  onSave,
  saving,
}: NotificationPreferencesProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <CardTitle>התראות אימייל</CardTitle>
        </div>
        <CardDescription>בחר אילו התראות תרצה לקבל באימייל</CardDescription>
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
            onCheckedChange={onEmailOnNewReviewChange}
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
            onCheckedChange={onEmailOnFailedPostChange}
            disabled={saving}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            שמור שינויים
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

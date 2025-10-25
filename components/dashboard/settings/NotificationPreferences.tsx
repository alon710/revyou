"use client";

import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
  DashboardCardFooter,
} from "@/components/ui/dashboard-card";
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
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle icon={<Bell className="h-5 w-5" />}>
          התראות אימייל
        </DashboardCardTitle>
        <DashboardCardDescription>
          בחר אילו התראות תרצה לקבל באימייל
        </DashboardCardDescription>
      </DashboardCardHeader>
      <DashboardCardContent className="space-y-6">
        {/* Email on New Review */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <Label htmlFor="emailOnNewReview" className="text-sm font-medium">
              ביקורת חדשה
            </Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
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
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <Label htmlFor="emailOnFailedPost" className="text-sm font-medium">
              פרסום נכשל
            </Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
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
      </DashboardCardContent>
      <DashboardCardFooter>
        <Button onClick={onSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          שמור שינויים
        </Button>
      </DashboardCardFooter>
    </DashboardCard>
  );
}

"use client";

import { Business } from "../../../../types/database";
import { DashboardCardField } from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationPreferencesSectionProps {
  business: Business;
  loading?: boolean;
  onSave: (data: { emailOnNewReview: boolean }) => Promise<void>;
}

interface NotificationPreferencesData {
  emailOnNewReview: boolean;
}

export default function NotificationPreferencesSection({
  business,
  loading,
  onSave,
}: NotificationPreferencesSectionProps) {
  const formData: NotificationPreferencesData = {
    emailOnNewReview: business.emailOnNewReview,
  };

  return (
    <EditableSection
      title="התראות אימייל"
      description="בחר אילו התראות תרצה לקבל באימייל עבור עסק זה"
      icon={<Bell className="h-5 w-5" />}
      modalTitle="עריכת התראות אימייל"
      modalDescription="בחר אילו התראות תרצה לקבל באימייל"
      loading={loading}
      data={formData}
      onSave={onSave}
      renderDisplay={() => (
        <DashboardCardField label="">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-foreground">
              קבל התראה באימייל כאשר מתקבלת ביקורת חדשה
            </p>
            <Badge
              variant={business.emailOnNewReview ? "default" : "secondary"}
            >
              {business.emailOnNewReview ? "מופעל" : "כבוי"}
            </Badge>
          </div>
        </DashboardCardField>
      )}
      renderForm={({ data, isLoading, onChange }) => (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <Label
              htmlFor="emailOnNewReview"
              className="text-sm font-medium cursor-pointer"
            >
              ביקורת חדשה
            </Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              קבל התראה באימייל כאשר מתקבלת ביקורת חדשה
            </p>
          </div>
          <Switch
            id="emailOnNewReview"
            checked={data.emailOnNewReview}
            onCheckedChange={(checked) => onChange("emailOnNewReview", checked)}
            disabled={isLoading}
          />
        </div>
      )}
    />
  );
}

"use client";

import { Business } from "@/lib/types";
import { DashboardCardField } from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TooltipIcon } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("dashboard.businesses.sections.notifications");
  const tCommon = useTranslations("common");

  const formData: NotificationPreferencesData = {
    emailOnNewReview: business.emailOnNewReview,
  };

  return (
    <EditableSection
      editButtonLabel={tCommon("edit")}
      title={t("title")}
      description={t("description")}
      icon={<Bell className="h-5 w-5" />}
      modalTitle={t("modalTitle")}
      modalDescription={t("modalDescription")}
      loading={loading}
      data={formData}
      onSave={onSave}
      successMessage={tCommon("saveSuccess")}
      errorMessage={tCommon("saveError")}
      cancelLabel={tCommon("cancel")}
      saveLabel={tCommon("save")}
      savingLabel={tCommon("saving")}
      renderDisplay={() => (
        <DashboardCardField label="">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-foreground">{t("emailOnNewReview.description")}</p>
            <Badge variant={business.emailOnNewReview ? "default" : "secondary"}>
              {business.emailOnNewReview ? t("enabled") : t("disabled")}
            </Badge>
          </div>
        </DashboardCardField>
      )}
      renderForm={({ data, isLoading, onChange }) => (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="emailOnNewReview" className="text-sm font-medium cursor-pointer">
                {t("emailOnNewReview.label")}
              </Label>
              <TooltipIcon text={t("emailOnNewReview.tooltip")} />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t("emailOnNewReview.helper")}</p>
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

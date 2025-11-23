"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/locale";
import { localeConfig } from "@/lib/locale";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import { DashboardCardField } from "@/components/ui/dashboard-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateUserSettings } from "@/lib/actions/users.actions";

interface UserSettings {
  locale: Locale;
  emailOnNewReview: boolean;
  weeklySummaryEnabled: boolean;
}

interface SettingsFormProps {
  initialSettings: UserSettings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const t = useTranslations("dashboard.accountSettings");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const handleSaveSettings = async (data: UserSettings) => {
    const previousLocale = initialSettings.locale;

    await updateUserSettings({
      locale: data.locale,
      emailOnNewReview: data.emailOnNewReview,
      weeklySummaryEnabled: data.weeklySummaryEnabled,
    });

    if (data.locale !== previousLocale) {
      router.push(`/${data.locale}/dashboard/settings`);
      router.refresh();
    } else {
      router.refresh();
    }
  };

  return (
    <EditableSection
      title={t("title")}
      description={t("description")}
      icon={<Globe className="h-5 w-5" />}
      modalTitle={t("title")}
      modalDescription={t("description")}
      loading={false}
      data={initialSettings}
      onSave={handleSaveSettings}
      successMessage={t("saveSuccess")}
      errorMessage={t("saveError")}
      cancelLabel={tCommon("cancel")}
      saveLabel={tCommon("save")}
      savingLabel={tCommon("saving")}
      renderDisplay={() => (
        <>
          <DashboardCardField
            label={t("languagePreferences.label")}
            value={
              <Badge variant="secondary">{localeConfig[initialSettings.locale]?.label || initialSettings.locale}</Badge>
            }
          />
          <DashboardCardField
            label={t("emailNotifications.label")}
            value={
              <Badge variant={initialSettings.emailOnNewReview ? "default" : "secondary"}>
                {initialSettings.emailOnNewReview ? t("emailNotifications.enabled") : t("emailNotifications.disabled")}
              </Badge>
            }
          />
          <DashboardCardField
            label={t("weeklySummary.label")}
            value={
              <Badge variant={initialSettings.weeklySummaryEnabled ? "default" : "secondary"}>
                {initialSettings.weeklySummaryEnabled ? t("weeklySummary.enabled") : t("weeklySummary.disabled")}
              </Badge>
            }
          />
        </>
      )}
      renderForm={({ data, isLoading, onChange }) => (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">{t("languagePreferences.title")}</h4>
              <p className="text-xs text-muted-foreground">{t("languagePreferences.description")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="locale">{t("languagePreferences.label")}</Label>
              <Select value={data.locale} onValueChange={(value) => onChange("locale", value as Locale)}>
                <SelectTrigger id="locale" disabled={isLoading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(localeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t("languagePreferences.tooltip")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">{t("emailNotifications.title")}</h4>
              <p className="text-xs text-muted-foreground">{t("emailNotifications.description")}</p>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label htmlFor="emailOnNewReview" className="text-sm font-medium cursor-pointer">
                  {t("emailNotifications.label")}
                </Label>
                <p className="text-xs text-muted-foreground">{t("emailNotifications.tooltip")}</p>
              </div>
              <Switch
                id="emailOnNewReview"
                checked={data.emailOnNewReview}
                onCheckedChange={(checked) => onChange("emailOnNewReview", checked)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">{t("weeklySummary.title")}</h4>
              <p className="text-xs text-muted-foreground">{t("weeklySummary.description")}</p>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label htmlFor="weeklySummaryEnabled" className="text-sm font-medium cursor-pointer">
                  {t("weeklySummary.label")}
                </Label>
                <p className="text-xs text-muted-foreground">{t("weeklySummary.tooltip")}</p>
              </div>
              <Switch
                id="weeklySummaryEnabled"
                checked={data.weeklySummaryEnabled}
                onCheckedChange={(checked) => onChange("weeklySummaryEnabled", checked)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    />
  );
}

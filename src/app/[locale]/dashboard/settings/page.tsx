"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localeConfig } from "@/i18n/config";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import { DashboardCardField } from "@/components/ui/dashboard-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

interface UserSettings {
  locale: Locale;
  emailOnNewReview: boolean;
}

export default function SettingsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const t = useTranslations("dashboard.accountSettings");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      if (!authUser) return;

      try {
        setLoading(true);
        const response = await fetch("/api/user/settings");

        if (!response.ok) {
          throw new Error("Failed to load settings");
        }

        const data = await response.json();
        setSettings({
          locale: data.locale,
          emailOnNewReview: data.emailOnNewReview === "true",
        });
      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error(t("loadError"));
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && authUser) {
      loadSettings();
    }
  }, [authUser, authLoading, t]);

  const handleSaveSettings = async (data: UserSettings) => {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locale: data.locale,
          emailOnNewReview: data.emailOnNewReview.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setSettings(data);

      if (data.locale !== settings?.locale) {
        router.push(`/${data.locale}/dashboard/settings`);
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  };

  if (authLoading || loading) {
    return <Loading size="md" fullScreen />;
  }

  if (!authUser || !settings) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="space-y-6 max-w-2xl">
        {}
        <EditableSection
          editButtonLabel={tCommon("edit")}
          title={t("title")}
          description={t("description")}
          icon={<Globe className="h-5 w-5" />}
          modalTitle={t("title")}
          modalDescription={t("description")}
          loading={loading}
          data={settings}
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
                value={<Badge variant="secondary">{localeConfig[settings.locale]?.label || settings.locale}</Badge>}
              />
              <DashboardCardField
                label={t("emailNotifications.label")}
                value={
                  <Badge variant={settings.emailOnNewReview ? "default" : "secondary"}>
                    {settings.emailOnNewReview ? t("emailNotifications.enabled") : t("emailNotifications.disabled")}
                  </Badge>
                }
              />
            </>
          )}
          renderForm={({ data, isLoading, onChange }) => (
            <div className="space-y-6">
              {}
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

              {}
              <div className="space-y-4 pt-4 border-t">
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
            </div>
          )}
        />
      </div>
    </PageContainer>
  );
}

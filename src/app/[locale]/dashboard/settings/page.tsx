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
import { EditableSection } from "@/components/dashboard/EditableSection";
import { DashboardCardField } from "@/components/dashboard/DashboardCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Globe, Bell } from "lucide-react";

interface UserSettings {
  locale: Locale;
  emailOnNewReview: string;
}

export default function SettingsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const t = useTranslations("dashboard.accountSettings");
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
        setSettings(data);
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

  const handleSaveLocale = async (locale: Locale) => {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locale }),
      });

      if (!response.ok) {
        throw new Error("Failed to save locale");
      }

      setSettings((prev) => (prev ? { ...prev, locale } : null));
      toast.success(t("saveSuccess"));

      // Navigate to the new locale
      router.push(`/${locale}/dashboard/settings`);
      router.refresh();
    } catch (error) {
      console.error("Error saving locale:", error);
      toast.error(t("saveError"));
      throw error;
    }
  };

  const handleSaveEmailNotifications = async (emailOnNewReview: boolean) => {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailOnNewReview: emailOnNewReview.toString() }),
      });

      if (!response.ok) {
        throw new Error("Failed to save email notifications");
      }

      setSettings((prev) => (prev ? { ...prev, emailOnNewReview: emailOnNewReview.toString() } : null));
      toast.success(t("saveSuccess"));
    } catch (error) {
      console.error("Error saving email notifications:", error);
      toast.error(t("saveError"));
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
        {/* Language Preferences Section */}
        <EditableSection
          title={t("languagePreferences.title")}
          description={t("languagePreferences.description")}
          icon={Globe}
          editModalTitle={t("languagePreferences.title")}
          onSave={async (formData) => {
            const locale = formData.get("locale") as Locale;
            await handleSaveLocale(locale);
          }}
          renderDisplay={() => (
            <DashboardCardField
              label={t("languagePreferences.label")}
              value={<Badge variant="secondary">{localeConfig[settings.locale]?.label || settings.locale}</Badge>}
            />
          )}
          renderForm={(formId) => (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="locale">{t("languagePreferences.label")}</Label>
                <Select name="locale" defaultValue={settings.locale}>
                  <SelectTrigger id="locale">
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
          )}
        />

        {/* Email Notifications Section */}
        <EditableSection
          title={t("emailNotifications.title")}
          description={t("emailNotifications.description")}
          icon={Bell}
          editModalTitle={t("emailNotifications.title")}
          onSave={async (formData) => {
            const emailOnNewReview = formData.get("emailOnNewReview") === "true";
            await handleSaveEmailNotifications(emailOnNewReview);
          }}
          renderDisplay={() => (
            <DashboardCardField
              label={t("emailNotifications.label")}
              value={
                <Badge variant={settings.emailOnNewReview === "true" ? "default" : "secondary"}>
                  {settings.emailOnNewReview === "true"
                    ? t("emailNotifications.enabled")
                    : t("emailNotifications.disabled")}
                </Badge>
              }
            />
          )}
          renderForm={(formId) => (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="emailOnNewReview">{t("emailNotifications.label")}</Label>
                  <p className="text-xs text-muted-foreground">{t("emailNotifications.tooltip")}</p>
                </div>
                <Switch
                  id="emailOnNewReview"
                  name="emailOnNewReview"
                  defaultChecked={settings.emailOnNewReview === "true"}
                  value="true"
                />
              </div>
            </div>
          )}
        />
      </div>
    </PageContainer>
  );
}

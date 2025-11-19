"use client";

import { Business } from "@/lib/types";
import { DashboardCardField } from "@/components/ui/dashboard-card";
import { Sparkles } from "lucide-react";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import {
  AIResponseSettingsForm,
  AIResponseSettingsFormData,
} from "@/components/dashboard/businesses/forms/AIResponseSettingsForm";
import { useTranslations } from "next-intl";

interface AIResponseSettingsSectionProps {
  business: Business;
  loading?: boolean;
  onSave: (data: Partial<Business>) => Promise<void>;
}

export default function AIResponseSettingsSection({ business, loading, onSave }: AIResponseSettingsSectionProps) {
  const t = useTranslations("dashboard.businesses.sections.aiSettings");
  const tCommon = useTranslations("common");

  const formData: AIResponseSettingsFormData = {
    toneOfVoice: business.toneOfVoice,
    languageMode: business.languageMode || "auto-detect",
    allowedEmojis: business.allowedEmojis || [],
    maxSentences: business.maxSentences || 2,
    signature: business.signature || "",
  };

  return (
    <EditableSection
      title={t("title")}
      description={t("description")}
      icon={<Sparkles className="h-5 w-5" />}
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
        <>
          <DashboardCardField label={t("fields.toneOfVoice")}>
            <p className="text-sm font-medium">
              {
                {
                  professional: t("toneOptions.professional"),
                  friendly: t("toneOptions.friendly"),
                  formal: t("toneOptions.formal"),
                  humorous: t("toneOptions.humorous"),
                }[business.toneOfVoice]
              }
            </p>
          </DashboardCardField>

          <DashboardCardField label={t("fields.languageMode")}>
            <p className="text-sm font-medium">
              {
                {
                  "auto-detect": t("languageOptions.autoDetect"),
                  hebrew: t("languageOptions.hebrew"),
                  english: t("languageOptions.english"),
                }[business.languageMode]
              }
            </p>
          </DashboardCardField>

          <DashboardCardField label={t("fields.emojis")}>
            <p className="text-sm font-medium">
              {business.allowedEmojis?.length ? business.allowedEmojis.join(" ") : t("noEmojis")}
            </p>
          </DashboardCardField>

          <DashboardCardField label={t("fields.maxSentences")}>
            <p className="text-sm font-medium">
              {business.maxSentences || 2} {t("sentencesUnit")}
            </p>
          </DashboardCardField>

          <DashboardCardField label={t("fields.signature")}>
            <p className="text-sm font-medium">{business.signature || t("noSignature")}</p>
          </DashboardCardField>
        </>
      )}
      renderForm={({ data, isLoading, onChange }) => (
        <AIResponseSettingsForm values={data} onChange={onChange} disabled={isLoading} />
      )}
    />
  );
}

"use client";

import { BusinessConfig } from "@/lib/types";
import { DashboardCardField } from "@/components/ui/dashboard-card";
import { Sparkles } from "lucide-react";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import {
  AIResponseSettingsForm,
  AIResponseSettingsFormData,
} from "@/components/dashboard/businesses/forms/AIResponseSettingsForm";
import { useTranslations } from "next-intl";

interface AIResponseSettingsSectionProps {
  config: BusinessConfig;
  loading?: boolean;
  onSave: (config: Partial<BusinessConfig>) => Promise<void>;
}

export default function AIResponseSettingsSection({ config, loading, onSave }: AIResponseSettingsSectionProps) {
  const t = useTranslations("dashboard.businesses.sections.aiSettings");
  const tCommon = useTranslations("common");

  const formData: AIResponseSettingsFormData = {
    toneOfVoice: config.toneOfVoice,
    languageMode: config.languageMode || "auto-detect",
    allowedEmojis: config.allowedEmojis || [],
    maxSentences: config.maxSentences || 2,
    signature: config.signature || "",
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
                }[config.toneOfVoice]
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
                }[config.languageMode]
              }
            </p>
          </DashboardCardField>

          <DashboardCardField label={t("fields.emojis")}>
            <p className="text-sm font-medium">
              {config.allowedEmojis?.length ? config.allowedEmojis.join(" ") : t("noEmojis")}
            </p>
          </DashboardCardField>

          <DashboardCardField label={t("fields.maxSentences")}>
            <p className="text-sm font-medium">
              {config.maxSentences || 2} {t("sentencesUnit")}
            </p>
          </DashboardCardField>

          <DashboardCardField label={t("fields.signature")}>
            <p className="text-sm font-medium">{config.signature || t("noSignature")}</p>
          </DashboardCardField>
        </>
      )}
      renderForm={({ data, isLoading, onChange }) => (
        <AIResponseSettingsForm values={data} onChange={onChange} disabled={isLoading} />
      )}
    />
  );
}

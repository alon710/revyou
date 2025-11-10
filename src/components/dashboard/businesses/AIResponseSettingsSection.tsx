"use client";

import { BusinessConfig } from "@/lib/types";
import { DashboardCardField } from "@/components/ui/dashboard-card";
import { Sparkles } from "lucide-react";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import {
  AIResponseSettingsForm,
  AIResponseSettingsFormData,
} from "@/components/dashboard/businesses/forms/AIResponseSettingsForm";

interface AIResponseSettingsSectionProps {
  config: BusinessConfig;
  loading?: boolean;
  onSave: (config: Partial<BusinessConfig>) => Promise<void>;
}

export default function AIResponseSettingsSection({ config, loading, onSave }: AIResponseSettingsSectionProps) {
  const formData: AIResponseSettingsFormData = {
    toneOfVoice: config.toneOfVoice,
    languageMode: config.languageMode || "auto-detect",
    allowedEmojis: config.allowedEmojis || [],
    maxSentences: config.maxSentences || 2,
    signature: config.signature || "",
  };

  return (
    <EditableSection
      title="הגדרות תגובה AI"
      description="הגדר את אופן יצירת התגובות האוטומטיות"
      icon={<Sparkles className="h-5 w-5" />}
      modalTitle="עריכת הגדרות תגובה AI"
      modalDescription="הגדר את אופן יצירת התגובות האוטומטיות"
      loading={loading}
      data={formData}
      onSave={onSave}
      renderDisplay={() => (
        <>
          <DashboardCardField label="סגנון תשובה">
            <p className="text-sm font-medium">
              {
                {
                  professional: "מקצועי",
                  friendly: "ידידותי",
                  formal: "פורמלי",
                  humorous: "משעשע",
                }[config.toneOfVoice]
              }
            </p>
          </DashboardCardField>

          <DashboardCardField label="שפת תגובה">
            <p className="text-sm font-medium">
              {
                {
                  "auto-detect": "זיהוי אוטומטי",
                  hebrew: "עברית",
                  english: "English",
                }[config.languageMode]
              }
            </p>
          </DashboardCardField>

          <DashboardCardField label="אימוג'ים מותרים">
            <p className="text-sm font-medium">
              {config.allowedEmojis?.length ? config.allowedEmojis.join(" ") : "ללא שימוש באימוג'ים"}
            </p>
          </DashboardCardField>

          <DashboardCardField label="מספר משפטים מקסימלי">
            <p className="text-sm font-medium">{config.maxSentences || 2} משפטים</p>
          </DashboardCardField>

          <DashboardCardField label="חתימה">
            <p className="text-sm font-medium">{config.signature || "ללא חתימה"}</p>
          </DashboardCardField>
        </>
      )}
      renderForm={({ data, isLoading, onChange }) => (
        <AIResponseSettingsForm values={data} onChange={onChange} disabled={isLoading} />
      )}
    />
  );
}

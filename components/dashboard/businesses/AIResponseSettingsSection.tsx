"use client";

import { useState } from "react";
import { BusinessConfig } from "@/types/database";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
  DashboardCardField,
} from "@/components/ui/dashboard-card";
import { Button } from "@/components/ui/button";
import { Sparkles, Settings } from "lucide-react";
import { AIResponseSettingsEditModal } from "@/components/dashboard/reviews/AIResponseSettingsEditModal";

interface AIResponseSettingsSectionProps {
  config: BusinessConfig;
  loading?: boolean;
  onSave: (config: Partial<BusinessConfig>) => Promise<void>;
}

export default function AIResponseSettingsSection({
  config,
  loading,
  onSave,
}: AIResponseSettingsSectionProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <DashboardCardTitle icon={<Sparkles className="h-5 w-5" />}>
                הגדרות תגובה AI
              </DashboardCardTitle>
              <DashboardCardDescription>
                הגדר את אופן יצירת התגובות האוטומטיות
              </DashboardCardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              disabled={loading}
            >
              <Settings className="ml-2 h-4 w-4" />
              עריכה
            </Button>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
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
              {config.allowedEmojis?.length
                ? config.allowedEmojis.join(" ")
                : "ללא שימוש באימוג'ים"}
            </p>
          </DashboardCardField>

          <DashboardCardField label="מספר משפטים מקסימלי">
            <p className="text-sm font-medium">
              {config.maxSentences || 2} משפטים
            </p>
          </DashboardCardField>

          <DashboardCardField label="חתימה">
            <p className="text-sm font-medium">
              {config.signature || "ללא חתימה"}
            </p>
          </DashboardCardField>
        </DashboardCardContent>
      </DashboardCard>

      <AIResponseSettingsEditModal
        config={config}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={onSave}
      />
    </>
  );
}

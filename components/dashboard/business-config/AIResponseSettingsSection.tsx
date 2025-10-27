"use client";

import { useState } from "react";
import { LocationConfig } from "@/types/database";
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
import {
  TONE_LABELS,
  LANGUAGE_LABELS,
} from "@/components/dashboard/business-config/types";
import { AIResponseSettingsEditModal } from "@/components/dashboard/business-config/AIResponseSettingsEditModal";

interface AIResponseSettingsSectionProps {
  config: LocationConfig;
  loading?: boolean;
  onSave: (config: Partial<LocationConfig>) => Promise<void>;
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
          {/* Tone of Voice */}
          <DashboardCardField label="סגנון תשובה">
            <p className="text-sm font-medium">
              {TONE_LABELS[config.toneOfVoice]}
            </p>
          </DashboardCardField>

          {/* Language */}
          <DashboardCardField label="שפת תגובה">
            <p className="text-sm font-medium">
              {LANGUAGE_LABELS[config.languageMode || "auto-detect"]}
            </p>
          </DashboardCardField>

          {/* Allowed Emojis */}
          <DashboardCardField label="אימוג'ים מותרים">
            <p className="text-sm font-medium">
              {config.allowedEmojis?.length
                ? config.allowedEmojis.join(" ")
                : "ללא שימוש באימוג'ים"}
            </p>
          </DashboardCardField>

          {/* Max Sentences */}
          <DashboardCardField label="מספר משפטים מקסימלי">
            <p className="text-sm font-medium">
              {config.maxSentences || 2} משפטים
            </p>
          </DashboardCardField>

          {/* Signature */}
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

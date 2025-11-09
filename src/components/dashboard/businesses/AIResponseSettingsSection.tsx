"use client";

import { BusinessConfig, ToneOfVoice, LanguageMode } from "@/lib/types";
import { DashboardCardField } from "@/components/ui/dashboard-card";
import { Sparkles } from "lucide-react";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AIResponseSettingsSectionProps {
  config: BusinessConfig;
  loading?: boolean;
  onSave: (config: Partial<BusinessConfig>) => Promise<void>;
}

interface AIResponseFormData {
  toneOfVoice: ToneOfVoice;
  languageMode: LanguageMode;
  allowedEmojis: string[];
  maxSentences: number;
  signature: string;
}

export default function AIResponseSettingsSection({ config, loading, onSave }: AIResponseSettingsSectionProps) {
  const formData: AIResponseFormData = {
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
        <>
          <div className="space-y-2">
            <Label htmlFor="toneOfVoice" className="block">
              סגנון תשובה
            </Label>
            <Select
              value={data.toneOfVoice}
              onValueChange={(value: ToneOfVoice) => onChange("toneOfVoice", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="toneOfVoice" dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="professional">מקצועי</SelectItem>
                <SelectItem value="friendly">ידידותי</SelectItem>
                <SelectItem value="formal">פורמלי</SelectItem>
                <SelectItem value="humorous">משעשע</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="languageMode" className="text-right block">
              שפת תגובה
            </Label>
            <Select
              value={data.languageMode}
              onValueChange={(value: LanguageMode) => onChange("languageMode", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="languageMode" dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="auto-detect">זיהוי אוטומטי</SelectItem>
                <SelectItem value="hebrew">עברית</SelectItem>
                <SelectItem value="english">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowedEmojis" className="text-right block">
              אימוג&apos;ים מותרים
            </Label>
            <Input
              id="allowedEmojis"
              type="text"
              value={data.allowedEmojis.join(" ")}
              onChange={(e) =>
                onChange(
                  "allowedEmojis",
                  e.target.value.split(" ").filter((e) => e.trim())
                )
              }
              placeholder="🥂 ✨ 🙏 💐 (או השאר ריק לאי שימוש באימוג'ים)"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-right">
              הפרד באמצעות רווחים. השאר ריק אם אינך רוצה שימוש באימוג&apos;ים
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxSentences" className="text-right block">
              מספר משפטים מקסימלי
            </Label>
            <Select
              value={data.maxSentences.toString()}
              onValueChange={(value) => onChange("maxSentences", parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger id="maxSentences" dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="1">משפט אחד</SelectItem>
                <SelectItem value="2">שני משפטים (מומלץ)</SelectItem>
                <SelectItem value="3">שלושה משפטים</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature" className="text-right block">
              חתימה
            </Label>
            <Input
              id="signature"
              type="text"
              value={data.signature}
              onChange={(e) => onChange("signature", e.target.value)}
              placeholder="צוות העסק"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-right">החתימה שתופיע בסוף כל תגובה</p>
          </div>
        </>
      )}
    />
  );
}

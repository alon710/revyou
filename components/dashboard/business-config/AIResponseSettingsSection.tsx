import { BusinessConfig, ToneOfVoice, LanguageMode } from "@/types/database";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
  DashboardCardField,
} from "@/components/ui/dashboard-card";
import { Sparkles } from "lucide-react";
import {
  SectionBaseProps,
  ConfigUpdateCallback,
  TONE_LABELS,
  LANGUAGE_LABELS,
} from "./types";

interface AIResponseSettingsSectionProps extends SectionBaseProps {
  config: BusinessConfig;
  onChange: ConfigUpdateCallback;
}

export default function AIResponseSettingsSection({
  variant,
  config,
  loading,
  onChange,
}: AIResponseSettingsSectionProps) {
  const isEditMode = variant === "edit";

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle icon={<Sparkles className="h-5 w-5" />}>
          הגדרות תגובה AI
        </DashboardCardTitle>
        <DashboardCardDescription>
          הגדר את אופן יצירת התגובות האוטומטיות
        </DashboardCardDescription>
      </DashboardCardHeader>
      <DashboardCardContent className="space-y-6">
        {/* Tone of Voice */}
        <DashboardCardField label="סגנון תשובה">
          {isEditMode ? (
            <Select
              value={config.toneOfVoice}
              onValueChange={(value: ToneOfVoice) =>
                onChange({ toneOfVoice: value })
              }
              disabled={loading}
            >
              <SelectTrigger id="toneOfVoice">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">מקצועי</SelectItem>
                <SelectItem value="friendly">ידידותי</SelectItem>
                <SelectItem value="formal">פורמלי</SelectItem>
                <SelectItem value="humorous">הומוריסטי</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm font-medium">
              {TONE_LABELS[config.toneOfVoice]}
            </p>
          )}
        </DashboardCardField>

        {/* Language */}
        <DashboardCardField label="שפת תגובה">
          {isEditMode ? (
            <Select
              value={config.languageMode || "auto-detect"}
              onValueChange={(value: LanguageMode) =>
                onChange({ languageMode: value })
              }
              disabled={loading}
            >
              <SelectTrigger id="languageMode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto-detect">זיהוי אוטומטי</SelectItem>
                <SelectItem value="hebrew">עברית</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="match-reviewer">התאמה למבקר</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm font-medium">
              {LANGUAGE_LABELS[config.languageMode || "auto-detect"]}
            </p>
          )}
        </DashboardCardField>

        {/* Allowed Emojis */}
        <DashboardCardField label="אימוג'ים מותרים">
          {isEditMode ? (
            <div className="space-y-2">
              <Input
                id="allowedEmojis"
                type="text"
                value={(config.allowedEmojis || []).join(" ")}
                onChange={(e) =>
                  onChange({
                    allowedEmojis: e.target.value
                      .split(" ")
                      .filter((e) => e.trim()),
                  })
                }
                placeholder="🥂 ✨ 🙏 💐 (או השאר ריק לאי שימוש באימוג'ים)"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                הפרד באמצעות רווחים. השאר ריק אם אינך רוצה שימוש באימוג&apos;ים
              </p>
            </div>
          ) : (
            <p className="text-sm font-medium">
              {config.allowedEmojis?.length
                ? config.allowedEmojis.join(" ")
                : "ללא שימוש באימוג'ים"}
            </p>
          )}
        </DashboardCardField>

        {/* Max Sentences */}
        <DashboardCardField label="מספר משפטים מקסימלי">
          {isEditMode ? (
            <Select
              value={(config.maxSentences || 2).toString()}
              onValueChange={(value) =>
                onChange({ maxSentences: parseInt(value) })
              }
              disabled={loading}
            >
              <SelectTrigger id="maxSentences">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">משפט אחד</SelectItem>
                <SelectItem value="2">שני משפטים (מומלץ)</SelectItem>
                <SelectItem value="3">שלושה משפטים</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm font-medium">
              {config.maxSentences || 2} משפטים
            </p>
          )}
        </DashboardCardField>

        {/* Signature */}
        <DashboardCardField label="חתימה">
          {isEditMode ? (
            <div className="space-y-2">
              <Input
                id="signature"
                type="text"
                value={config.signature || ""}
                onChange={(e) => onChange({ signature: e.target.value })}
                placeholder="צוות העסק"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                החתימה שתופיע בסוף כל תגובה
              </p>
            </div>
          ) : (
            <p className="text-sm font-medium">
              {config.signature || "ללא חתימה"}
            </p>
          )}
        </DashboardCardField>
      </DashboardCardContent>
    </DashboardCard>
  );
}

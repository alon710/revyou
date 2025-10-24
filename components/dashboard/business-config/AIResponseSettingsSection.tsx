import { BusinessConfig, ToneOfVoice, LanguageMode } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>הגדרות תגובה AI</CardTitle>
        <CardDescription>הגדר את אופן יצירת התגובות האוטומטיות</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tone of Voice */}
        <div className="space-y-2">
          <Label htmlFor="toneOfVoice">סגנון תשובה</Label>
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
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="languageMode">שפת תגובה</Label>
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
        </div>

        {/* Allowed Emojis */}
        <div className="space-y-2">
          <Label htmlFor="allowedEmojis">אימוג&apos;ים מותרים</Label>
          {isEditMode ? (
            <>
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
            </>
          ) : (
            <p className="text-sm font-medium">
              {config.allowedEmojis?.length
                ? config.allowedEmojis.join(" ")
                : "ללא שימוש באימוג'ים"}
            </p>
          )}
        </div>

        {/* Max Sentences */}
        <div className="space-y-2">
          <Label htmlFor="maxSentences">מספר משפטים מקסימלי</Label>
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
        </div>

        {/* Signature */}
        <div className="space-y-2">
          <Label htmlFor="signature">חתימה</Label>
          {isEditMode ? (
            <>
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
            </>
          ) : (
            <p className="text-sm font-medium">
              {config.signature || "ללא חתימה"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

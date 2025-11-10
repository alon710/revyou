"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipIcon } from "@/components/ui/tooltip";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { ToneOfVoice, LanguageMode } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import emojiRegex from "emoji-regex";

export interface AIResponseSettingsFormData {
  toneOfVoice: ToneOfVoice;
  languageMode: LanguageMode;
  allowedEmojis: string[];
  maxSentences: number;
  signature: string;
}

interface AIResponseSettingsFormProps {
  values: AIResponseSettingsFormData;
  onChange: (
    field: keyof AIResponseSettingsFormData,
    value: string | string[] | number | ToneOfVoice | LanguageMode
  ) => void;
  showTooltips?: boolean;
  disabled?: boolean;
}

const extractEmojis = (text: string): string[] => {
  const regex = emojiRegex();
  const matches = text.match(regex);
  return matches ? Array.from(new Set(matches)) : [];
};

export function AIResponseSettingsForm({
  values,
  onChange,
  showTooltips = true,
  disabled = false,
}: AIResponseSettingsFormProps) {
  const isMobile = useIsMobile();

  const handleEmojiChange = (value: string) => {
    const emojis = extractEmojis(value);
    onChange("allowedEmojis", emojis);
  };

  const handleEmojiSelect = (emoji: string) => {
    const currentEmojis = values.allowedEmojis;
    if (!currentEmojis.includes(emoji)) {
      onChange("allowedEmojis", [...currentEmojis, emoji]);
    }
  };
  return (
    <div className="space-y-6" dir="rtl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && (
            <TooltipIcon text="בחר את סגנון הכתיבה של התשובות האוטומטיות: מקצועי לעסקים רציניים, ידידותי לעסקים מזדמנים, פורמלי למקומות יוקרתיים, או משעשע לעסקים עם אווירה קלילה" />
          )}
          <Label htmlFor="toneOfVoice">סגנון תשובה</Label>
        </div>
        <Select
          value={values.toneOfVoice}
          onValueChange={(value: ToneOfVoice) => onChange("toneOfVoice", value)}
          disabled={disabled}
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
        <div className="flex items-center gap-2">
          {showTooltips && (
            <TooltipIcon text="בחר בזיהוי אוטומטי כדי שהמערכת תזהה את שפת הביקורת ותגיב באותה שפה, או בחר שפה קבועה לכל התגובות" />
          )}
          <Label htmlFor="languageMode">שפת תגובה</Label>
        </div>
        <Select
          value={values.languageMode}
          onValueChange={(value: LanguageMode) => onChange("languageMode", value)}
          disabled={disabled}
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
        <div className="flex items-center gap-2">
          {showTooltips && (
            <TooltipIcon text="הגדר אילו אימוג'ים המערכת רשאית להשתמש בהם בתגובות. הפרד באמצעות רווחים. השאר ריק אם אינך רוצה שימוש באימוג'ים כלל" />
          )}
          <Label htmlFor="allowedEmojis">אימוג&apos;ים מותרים</Label>
        </div>
        <div className="flex gap-2">
          <Input
            id="allowedEmojis"
            type="text"
            value={values.allowedEmojis.join(" ")}
            onChange={(e) => handleEmojiChange(e.target.value)}
            placeholder="✨ 🙏 ❤️ (או השאר ריק לאי שימוש באימוג'ים)"
            disabled={disabled}
            dir="ltr"
            className="flex-1"
          />
          <EmojiPicker onEmojiSelect={handleEmojiSelect} disabled={disabled} />
        </div>
        <p className="text-xs text-muted-foreground text-right">
          רק אימוג&apos;ים תקינים יישמרו. כל תווים אחרים יוסרו אוטומטית
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && (
            <TooltipIcon text="קבע את אורך התגובות. משפט אחד לתגובות קצרות, שני משפטים (מומלץ) לאיזון בין תמציתיות לתוכן, שלושה משפטים לתגובות מפורטות יותר" />
          )}
          <Label htmlFor="maxSentences">מספר משפטים מקסימלי</Label>
        </div>
        <Select
          value={values.maxSentences.toString()}
          onValueChange={(value) => onChange("maxSentences", parseInt(value))}
          disabled={disabled}
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
        <div className="flex items-center gap-2">
          {showTooltips && (
            <TooltipIcon text="טקסט שיופיע בסוף כל תגובה אוטומטית, למשל 'צוות מסעדת דוד' או 'בברכה, מוטי'" />
          )}
          <Label htmlFor="signature">חתימה</Label>
        </div>
        <Input
          id="signature"
          type="text"
          value={values.signature}
          onChange={(e) => onChange("signature", e.target.value)}
          placeholder="צוות העסק"
          disabled={disabled}
          dir="rtl"
        />
        <p className="text-xs text-muted-foreground text-right">החתימה שתופיע בסוף כל תגובה</p>
      </div>
    </div>
  );
}

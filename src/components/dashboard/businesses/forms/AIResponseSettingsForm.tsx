"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipIcon } from "@/components/ui/tooltip";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { ToneOfVoice, LanguageMode } from "@/lib/types";
import emojiRegex from "emoji-regex";
import { useTranslations, useLocale } from "next-intl";
import { getLocaleDir, type Locale } from "@/lib/locale";
import type { PlanLimits } from "@/lib/subscriptions/plans";

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
  limits: PlanLimits;
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
  limits: _limits,
}: AIResponseSettingsFormProps) {
  const t = useTranslations("dashboard.businesses.forms.aiSettings");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;
  const dir = getLocaleDir(locale);

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
    <div className="space-y-6" dir={dir}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && (
            <TooltipIcon
              text={t("toneOfVoice.tooltip")}
              additionalInfoLabel={t("toneOfVoice.label")}
              closeLabel={tCommon("close")}
            />
          )}
          <Label htmlFor="toneOfVoice">{t("toneOfVoice.label")}</Label>
        </div>
        <Select
          value={values.toneOfVoice}
          onValueChange={(value: ToneOfVoice) => onChange("toneOfVoice", value)}
          disabled={disabled}
        >
          <SelectTrigger id="toneOfVoice">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">{t("toneOfVoice.options.professional")}</SelectItem>
            <SelectItem value="friendly">{t("toneOfVoice.options.friendly")}</SelectItem>
            <SelectItem value="formal">{t("toneOfVoice.options.formal")}</SelectItem>
            <SelectItem value="humorous">{t("toneOfVoice.options.humorous")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && (
            <TooltipIcon
              text={t("languageMode.tooltip")}
              additionalInfoLabel={t("languageMode.label")}
              closeLabel={tCommon("close")}
            />
          )}
          <Label htmlFor="languageMode">{t("languageMode.label")}</Label>
        </div>
        <Select
          value={values.languageMode}
          onValueChange={(value: LanguageMode) => onChange("languageMode", value)}
          disabled={disabled}
        >
          <SelectTrigger id="languageMode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto-detect">{t("languageMode.options.autoDetect")}</SelectItem>
            <SelectItem value="hebrew">{t("languageMode.options.hebrew")}</SelectItem>
            <SelectItem value="english">{t("languageMode.options.english")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && (
            <TooltipIcon
              text={t("emojis.tooltip")}
              additionalInfoLabel={t("emojis.label")}
              closeLabel={tCommon("close")}
            />
          )}
          <Label htmlFor="allowedEmojis">{t("emojis.label")}</Label>
        </div>
        <div className="flex gap-2">
          <Input
            id="allowedEmojis"
            type="text"
            value={values.allowedEmojis.join(" ")}
            onChange={(e) => handleEmojiChange(e.target.value)}
            placeholder={t("emojis.placeholder")}
            disabled={disabled}
            dir="ltr"
            className="flex-1"
          />
          <EmojiPicker onEmojiSelect={handleEmojiSelect} disabled={disabled} />
        </div>
        <p className="text-xs text-muted-foreground text-start">{t("emojis.helper")}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && (
            <TooltipIcon
              text={t("maxSentences.tooltip")}
              additionalInfoLabel={t("maxSentences.label")}
              closeLabel={tCommon("close")}
            />
          )}
          <Label htmlFor="maxSentences">{t("maxSentences.label")}</Label>
        </div>
        <Select
          value={values.maxSentences.toString()}
          onValueChange={(value) => onChange("maxSentences", parseInt(value))}
          disabled={disabled}
        >
          <SelectTrigger id="maxSentences">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{t("maxSentences.options.one")}</SelectItem>
            <SelectItem value="2">{t("maxSentences.options.two")}</SelectItem>
            <SelectItem value="3">{t("maxSentences.options.three")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && (
            <TooltipIcon
              text={t("signature.tooltip")}
              additionalInfoLabel={t("signature.label")}
              closeLabel={tCommon("close")}
            />
          )}
          <Label htmlFor="signature">{t("signature.label")}</Label>
        </div>
        <Input
          id="signature"
          type="text"
          value={values.signature}
          onChange={(e) => onChange("signature", e.target.value)}
          placeholder={t("signature.placeholder")}
          disabled={disabled}
          dir={dir}
        />
        <p className="text-xs text-muted-foreground text-start">{t("signature.helper")}</p>
      </div>
    </div>
  );
}

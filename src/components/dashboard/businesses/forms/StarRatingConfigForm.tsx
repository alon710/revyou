"use client";

import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/ui/StarRating";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TooltipIcon } from "@/components/ui/tooltip";
import { BusinessConfig } from "@/lib/types";
import { useTranslations } from "next-intl";

export type StarRatingConfigFormData = BusinessConfig["starConfigs"];

interface StarRatingConfigFormProps {
  values: StarRatingConfigFormData;
  onChange: (rating: 1 | 2 | 3 | 4 | 5, config: { autoReply: boolean; customInstructions: string }) => void;
  showTooltips?: boolean;
  disabled?: boolean;
}

export function StarRatingConfigForm({
  values,
  onChange,
  showTooltips = true,
  disabled = false,
}: StarRatingConfigFormProps) {
  const t = useTranslations("dashboard.businesses.forms.starRatings");
  const tCommon = useTranslations("common");

  return (
    <div className="space-y-6 overflow-y-auto max-h-[60vh]">
      {([5, 4, 3, 2, 1] as const).map((rating) => {
        const starConfig = values[rating];

        return (
          <div key={rating} className="pb-6 last:pb-0 border-b last:border-b-0 border-border/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {showTooltips && (
                    <TooltipIcon
                      text={t("autoReply.tooltip")}
                      additionalInfoLabel={t("autoReply.label")}
                      closeLabel={tCommon("close")}
                    />
                  )}
                  <Label htmlFor={`auto-reply-${rating}`} className="text-sm font-medium cursor-pointer">
                    {t("autoReply.label")}
                  </Label>
                </div>
                <Switch
                  id={`auto-reply-${rating}`}
                  checked={starConfig.autoReply}
                  onCheckedChange={(checked) =>
                    onChange(rating, {
                      ...starConfig,
                      autoReply: checked,
                    })
                  }
                  disabled={disabled}
                />
              </div>
              <StarRating rating={rating} size={18} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {showTooltips && (
                  <TooltipIcon
                    text={t("customInstructions.tooltip")}
                    additionalInfoLabel={t("customInstructions.label")}
                    closeLabel={tCommon("close")}
                  />
                )}
                <Label htmlFor={`instructions-${rating}`}>{t("customInstructions.label")}</Label>
              </div>
              <Textarea
                id={`instructions-${rating}`}
                value={starConfig.customInstructions}
                onChange={(e) =>
                  onChange(rating, {
                    ...starConfig,
                    customInstructions: e.target.value,
                  })
                }
                placeholder={t("customInstructions.placeholder")}
                rows={3}
                disabled={disabled}
                className="text-sm resize-none"
              />
              {rating <= 2 && (
                <p className="text-xs text-muted-foreground text-end">{t("customInstructions.helpers.low")}</p>
              )}
              {rating === 3 && (
                <p className="text-xs text-muted-foreground text-end">{t("customInstructions.helpers.medium")}</p>
              )}
              {rating >= 4 && (
                <p className="text-xs text-muted-foreground text-end">{t("customInstructions.helpers.high")}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

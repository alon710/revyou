"use client";

import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/ui/StarRating";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TooltipIcon } from "@/components/ui/tooltip";
import { BusinessConfig } from "@/lib/types";

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
  return (
    <div className="space-y-6 overflow-y-auto max-h-[60vh]" dir="rtl">
      {([5, 4, 3, 2, 1] as const).map((rating) => {
        const starConfig = values[rating];

        return (
          <div key={rating} className="pb-6 last:pb-0 border-b last:border-b-0 border-border/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {showTooltips && (
                    <TooltipIcon text="כאשר מופעל, המערכת תיצור ותשלח תשובה אוטומטית לביקורות בדירוג זה. ניתן להשבית עבור דירוגים שאתה מעדיף לטפל בהם ידנית" />
                  )}
                  <Label htmlFor={`auto-reply-${rating}`} className="text-sm font-medium cursor-pointer">
                    תגובה אוטומטית
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
                  <TooltipIcon text="הוסף הנחיות ספציפיות שיכוונו את ה-AI איך לגבש תשובות לביקורות בדירוג זה. לדוגמה, עבור 1-2 כוכבים תוכל לבקש התנצלות והזמנה ליצור קשר" />
                )}
                <Label htmlFor={`instructions-${rating}`}>הנחיות מותאמות אישית</Label>
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
                placeholder="הוסף הנחיות ספציפיות לדירוג זה..."
                rows={3}
                disabled={disabled}
                className="text-sm resize-none"
                dir="rtl"
              />
              {rating <= 2 && (
                <p className="text-xs text-muted-foreground text-right">
                  מומלץ לכלול התנצלות ומספר טלפון לתיאום שיחה אישית עם הלקוח
                </p>
              )}
              {rating === 3 && (
                <p className="text-xs text-muted-foreground text-right">
                  מומלץ להביע הערכה על המשוב ולהראות רצון לשיפור
                </p>
              )}
              {rating >= 4 && (
                <p className="text-xs text-muted-foreground text-right">מומלץ להביע תודה חמה ולעודד ביקור חוזר</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { BusinessConfig } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface StarRatingConfigSectionProps {
  starConfigs: BusinessConfig["starConfigs"];
  loading?: boolean;
  onSave: (starConfigs: BusinessConfig["starConfigs"]) => Promise<void>;
}

export default function StarRatingConfigSection({ starConfigs, loading, onSave }: StarRatingConfigSectionProps) {
  return (
    <EditableSection
      title="הגדרות לפי דירוג כוכבים"
      description="התאם אישית תגובות AI עבור כל דירוג"
      icon={<Star className="h-5 w-5" />}
      modalTitle="עריכת הגדרות לפי דירוג כוכבים"
      modalDescription="התאם אישית תגובות AI עבור כל דירוג"
      loading={loading}
      data={starConfigs}
      onSave={(configs) => onSave(configs as BusinessConfig["starConfigs"])}
      renderDisplay={() => (
        <>
          {([5, 4, 3, 2, 1] as const).map((rating) => {
            const starConfig = starConfigs[rating];

            return (
              <div key={rating} className="pb-6 last:pb-0 border-b last:border-b-0 border-border/40">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={starConfig.autoReply ? "default" : "secondary"}>
                    תגובה אוטומטית {starConfig.autoReply ? "פעילה" : "כבויה"}
                  </Badge>
                  <StarRating rating={rating} size={18} />
                </div>

                {starConfig.customInstructions ? (
                  <div className="text-sm bg-muted/50 p-3 rounded-md">
                    <p className="whitespace-pre-wrap leading-relaxed">{starConfig.customInstructions}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">אין הנחיות מיוחדות</p>
                )}
              </div>
            );
          })}
        </>
      )}
      renderForm={({ data, isLoading, onChange }) => (
        <div className="space-y-6 overflow-y-auto max-h-[50vh]">
          {([5, 4, 3, 2, 1] as const).map((rating) => {
            const starConfig = data[rating];

            return (
              <div key={rating} className="pb-6 last:pb-0 border-b last:border-b-0 border-border/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Label htmlFor={`auto-reply-${rating}`} className="text-sm font-medium cursor-pointer">
                      תגובה אוטומטית
                    </Label>
                    <Switch
                      id={`auto-reply-${rating}`}
                      checked={starConfig.autoReply}
                      onCheckedChange={(checked) =>
                        onChange(rating, {
                          ...starConfig,
                          autoReply: checked,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <StarRating rating={rating} size={18} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`instructions-${rating}`} className="text-right block">
                    הנחיות מותאמות אישית
                  </Label>
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
                    disabled={isLoading}
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    />
  );
}

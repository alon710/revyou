import { BusinessConfig } from "@/types/database";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import { Star } from "lucide-react";
import { SectionBaseProps, StarConfigUpdateCallback } from "./types";
import { StarRating } from "@/components/ui/StarRating";

interface StarRatingConfigSectionProps extends SectionBaseProps {
  starConfigs: BusinessConfig["starConfigs"];
  onChange: StarConfigUpdateCallback;
}

export default function StarRatingConfigSection({
  variant,
  starConfigs,
  loading,
  onChange,
}: StarRatingConfigSectionProps) {
  const isEditMode = variant === "edit";

  const starLabels: Record<number, string> = {
    5: "5 כוכבים",
    4: "4 כוכבים",
    3: "3 כוכבים",
    2: "2 כוכבים",
    1: "1 כוכב",
  };

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle icon={<Star className="h-5 w-5" />}>
          הגדרות לפי דירוג כוכבים
        </DashboardCardTitle>
        <DashboardCardDescription>
          התאם אישית תגובות AI עבור כל דירוג
        </DashboardCardDescription>
      </DashboardCardHeader>
      <DashboardCardContent className="space-y-6">
        {([5, 4, 3, 2, 1] as const).map((rating) => {
          const starConfig = starConfigs[rating];

          return (
            <div
              key={rating}
              className="pb-1 last:pb-0 border-b last:border-b-0 border-border/40"
            >
              <div className="flex items-center justify-between">
                {isEditMode && (
                  <Switch
                    id={`auto-reply-${rating}`}
                    checked={starConfig.autoReply}
                    onCheckedChange={(checked) =>
                      onChange(rating, "autoReply", checked)
                    }
                    disabled={loading}
                  />
                )}
              </div>

              {/* Custom Instructions */}
              {isEditMode ? (
                <Textarea
                  id={`instructions-${rating}`}
                  value={starConfig.customInstructions}
                  onChange={(e) =>
                    onChange(rating, "customInstructions", e.target.value)
                  }
                  placeholder="הוסף הנחיות ספציפיות לדירוג זה..."
                  rows={2}
                  disabled={loading}
                  className="text-sm resize-none"
                />
              ) : starConfig.customInstructions ? (
                <div className="text-sm bg-muted/50 p-3 rounded-md flex items-start gap-3">
                  <p className="whitespace-pre-wrap leading-relaxed flex-1">
                    {starConfig.customInstructions}
                  </p>
                  <StarRating rating={rating} size={14} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  אין הנחיות מיוחדות
                </p>
              )}
            </div>
          );
        })}
      </DashboardCardContent>
    </DashboardCard>
  );
}

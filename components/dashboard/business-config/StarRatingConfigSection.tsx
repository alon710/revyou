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
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">
                    {starLabels[rating]}
                  </Label>
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${
                      starConfig.autoReply
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    }`}
                    title={
                      starConfig.autoReply
                        ? "תגובה אוטומטית פעילה"
                        : "תגובה אוטומטית כבויה"
                    }
                  />
                </div>
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
                <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap leading-relaxed">
                  {starConfig.customInstructions}
                </p>
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

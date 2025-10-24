import { BusinessConfig } from "@/types/database";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-4">
      {([5, 4, 3, 2, 1] as const).map((rating) => {
        const starConfig = starConfigs[rating];

        return (
          <div key={rating} className="space-y-2">
            {/* Rating Header with Auto-Reply Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {starLabels[rating]}
              </Label>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor={`auto-reply-${rating}`}
                  className="text-xs text-muted-foreground"
                >
                  תגובה אוטומטית
                </Label>
                {isEditMode ? (
                  <Switch
                    id={`auto-reply-${rating}`}
                    checked={starConfig.autoReply}
                    onCheckedChange={(checked) =>
                      onChange(rating, "autoReply", checked)
                    }
                    disabled={loading}
                  />
                ) : (
                  <Badge
                    variant={starConfig.autoReply ? "default" : "secondary"}
                  >
                    {starConfig.autoReply ? "פעיל" : "כבוי"}
                  </Badge>
                )}
              </div>
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
                className="text-sm"
              />
            ) : starConfig.customInstructions ? (
              <p className="text-sm bg-muted/30 p-2 rounded whitespace-pre-wrap">
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
    </div>
  );
}

import { BusinessConfig } from "@/types/database";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>הגדרות לפי דירוג כוכבים</CardTitle>
        <CardDescription>התאם אישית תגובות AI עבור כל דירוג</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {([5, 4, 3, 2, 1] as const).map((rating) => {
          const starConfig = starConfigs[rating];

          return (
            <div key={rating} className="space-y-2">
              {/* Rating Header with Auto-Reply Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">
                    {starLabels[rating]}
                  </Label>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      starConfig.autoReply
                        ? "bg-green-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                    title={starConfig.autoReply ? "תגובה אוטומטית פעילה" : "תגובה אוטומטית כבויה"}
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
      </CardContent>
    </Card>
  );
}

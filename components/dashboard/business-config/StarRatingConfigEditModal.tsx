"use client";

import { useState } from "react";
import { BusinessConfig, StarConfig } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";

interface StarRatingConfigEditModalProps {
  starConfigs: BusinessConfig["starConfigs"];
  open: boolean;
  onClose: () => void;
  onSave: (starConfigs: BusinessConfig["starConfigs"]) => Promise<void>;
}

export function StarRatingConfigEditModal({
  starConfigs,
  open,
  onClose,
  onSave,
}: StarRatingConfigEditModalProps) {
  const [localStarConfigs, setLocalStarConfigs] =
    useState<BusinessConfig["starConfigs"]>(starConfigs);
  const [isLoading, setIsLoading] = useState(false);

  const updateStarConfig = (
    rating: 1 | 2 | 3 | 4 | 5,
    field: keyof StarConfig,
    value: string | boolean
  ) => {
    setLocalStarConfigs((prev) => ({
      ...prev,
      [rating]: {
        ...prev[rating],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave(localStarConfigs);
      onClose();
    } catch (error) {
      console.error("Error saving star rating config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setLocalStarConfigs(starConfigs);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            עריכת הגדרות לפי דירוג כוכבים
          </DialogTitle>
          <DialogDescription className="text-right">
            התאם אישית תגובות AI עבור כל דירוג
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto max-h-[50vh]">
          {([5, 4, 3, 2, 1] as const).map((rating) => {
            const starConfig = localStarConfigs[rating];

            return (
              <div
                key={rating}
                className="pb-6 last:pb-0 border-b last:border-b-0 border-border/40"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Label
                      htmlFor={`auto-reply-${rating}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      תגובה אוטומטית
                    </Label>
                    <Switch
                      id={`auto-reply-${rating}`}
                      checked={starConfig.autoReply}
                      onCheckedChange={(checked) =>
                        updateStarConfig(rating, "autoReply", checked)
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <StarRating rating={rating} size={18} />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor={`instructions-${rating}`}
                    className="text-right block"
                  >
                    הנחיות מותאמות אישית
                  </Label>
                  <Textarea
                    id={`instructions-${rating}`}
                    value={starConfig.customInstructions}
                    onChange={(e) =>
                      updateStarConfig(
                        rating,
                        "customInstructions",
                        e.target.value
                      )
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

        <DialogFooter className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            ביטול
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? <>שומר...</> : <>שמירה</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

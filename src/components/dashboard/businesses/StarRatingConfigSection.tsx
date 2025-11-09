"use client";

import { BusinessConfig } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import { StarRatingConfigForm } from "@/components/dashboard/businesses/forms/StarRatingConfigForm";

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
        <StarRatingConfigForm values={data} onChange={onChange} disabled={isLoading} />
      )}
    />
  );
}

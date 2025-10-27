"use client";

import { useState } from "react";
import { BusinessConfig } from "@/types/database";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Settings } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { StarRatingConfigEditModal } from "@/components/dashboard/business-config/StarRatingConfigEditModal";

interface StarRatingConfigSectionProps {
  starConfigs: BusinessConfig["starConfigs"];
  loading?: boolean;
  onSave: (starConfigs: BusinessConfig["starConfigs"]) => Promise<void>;
}

export default function StarRatingConfigSection({
  starConfigs,
  loading,
  onSave,
}: StarRatingConfigSectionProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <DashboardCardTitle icon={<Star className="h-5 w-5" />}>
                הגדרות לפי דירוג כוכבים
              </DashboardCardTitle>
              <DashboardCardDescription>
                התאם אישית תגובות AI עבור כל דירוג
              </DashboardCardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              disabled={loading}
            >
              <Settings className="ml-2 h-4 w-4" />
              עריכה
            </Button>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
          {([5, 4, 3, 2, 1] as const).map((rating) => {
            const starConfig = starConfigs[rating];

            return (
              <div
                key={rating}
                className="pb-6 last:pb-0 border-b last:border-b-0 border-border/40"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant={starConfig.autoReply ? "default" : "secondary"}
                  >
                    תגובה אוטומטית {starConfig.autoReply ? "פעילה" : "כבויה"}
                  </Badge>
                  <StarRating rating={rating} size={18} />
                </div>

                {starConfig.customInstructions ? (
                  <div className="text-sm bg-muted/50 p-3 rounded-md">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {starConfig.customInstructions}
                    </p>
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

      <StarRatingConfigEditModal
        starConfigs={starConfigs}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={onSave}
      />
    </>
  );
}

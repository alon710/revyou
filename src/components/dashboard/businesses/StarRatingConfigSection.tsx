"use client";

import { BusinessConfig } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import { StarRatingConfigForm } from "@/components/dashboard/businesses/forms/StarRatingConfigForm";
import { useTranslations } from "next-intl";

interface StarRatingConfigSectionProps {
  starConfigs: BusinessConfig["starConfigs"];
  loading?: boolean;
  onSave: (starConfigs: BusinessConfig["starConfigs"]) => Promise<void>;
}

export default function StarRatingConfigSection({ starConfigs, loading, onSave }: StarRatingConfigSectionProps) {
  const t = useTranslations("dashboard.businesses.sections.starRatings");
  const tCommon = useTranslations("common");

  return (
    <EditableSection
      title={t("title")}
      description={t("description")}
      icon={<Star className="h-5 w-5" />}
      modalTitle={t("modalTitle")}
      modalDescription={t("modalDescription")}
      loading={loading}
      data={starConfigs}
      onSave={(configs) => onSave(configs as BusinessConfig["starConfigs"])}
      successMessage={tCommon("saveSuccess")}
      errorMessage={tCommon("saveError")}
      cancelLabel={tCommon("cancel")}
      saveLabel={tCommon("save")}
      savingLabel={tCommon("saving")}
      renderDisplay={() => (
        <>
          {([5, 4, 3, 2, 1] as const).map((rating) => {
            const starConfig = starConfigs[rating];

            return (
              <div key={rating} className="pb-6 last:pb-0 border-b last:border-b-0 border-border/40">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={starConfig.autoReply ? "default" : "secondary"}>
                    {t("autoReply")} {starConfig.autoReply ? t("enabled") : t("disabled")}
                  </Badge>
                  <StarRating rating={rating} size={18} />
                </div>

                {starConfig.customInstructions ? (
                  <div className="text-sm bg-muted/50 p-3 rounded-md">
                    <p className="whitespace-pre-wrap leading-relaxed">{starConfig.customInstructions}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">{t("noInstructions")}</p>
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

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/routing";
import {
  StarRatingConfigForm,
  StarRatingConfigFormData,
} from "@/components/dashboard/businesses/forms/StarRatingConfigForm";
import { getDefaultBusinessConfig } from "@/lib/utils/business-config";
import { toast } from "sonner";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";
import { useTranslations } from "next-intl";
import { updateBusinessConfig } from "@/lib/actions/businesses.actions";

interface StarRatingsWrapperProps {
  accountId: string;
  businessId: string;
}

export function StarRatingsWrapper({ accountId, businessId }: StarRatingsWrapperProps) {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("onboarding.starRatings");
  const tCommon = useTranslations("onboarding.common");

  const starRatings = useOnboardingStore((state) => state.starRatings);
  const setAccountId = useOnboardingStore((state) => state.setAccountId);
  const setBusinessId = useOnboardingStore((state) => state.setBusinessId);
  const setStarRatings = useOnboardingStore((state) => state.setStarRatings);
  const getCombinedConfig = useOnboardingStore((state) => state.getCombinedConfig);
  const reset = useOnboardingStore((state) => state.reset);

  const [formData, setFormData] = useState<StarRatingConfigFormData>(() => {
    if (starRatings) {
      return starRatings;
    }
    const defaults = getDefaultBusinessConfig();
    return defaults.starConfigs;
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAccountId(accountId);
    setBusinessId(businessId);
  }, [accountId, businessId, setAccountId, setBusinessId]);

  const handleFormChange = (rating: 1 | 2 | 3 | 4 | 5, config: { autoReply: boolean; customInstructions: string }) => {
    const updatedData = {
      ...formData,
      [rating]: config,
    };
    setFormData(updatedData);
    setStarRatings(updatedData);
  };

  const handleBack = () => {
    router.push(`/onboarding/ai-settings?accountId=${accountId}&businessId=${businessId}`);
  };

  const handleFinish = async () => {
    if (!user || !accountId || !businessId) return;

    try {
      setSaving(true);

      const config = getCombinedConfig();

      await updateBusinessConfig(user.id, accountId, businessId, config);

      reset();

      toast.success(t("successMessage"));

      router.push("/dashboard/home");
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error(t("errorMessage"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingCard
      title={t("title")}
      description={t("description")}
      backButton={{ onClick: handleBack, loading: saving, label: tCommon("back") }}
      nextButton={{
        label: tCommon("finish"),
        loadingLabel: tCommon("saving"),
        onClick: handleFinish,
        loading: saving,
      }}
    >
      <StarRatingConfigForm values={formData} onChange={handleFormChange} />
    </OnboardingCard>
  );
}

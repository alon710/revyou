"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

export default function OnboardingStarRatings() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("onboarding.starRatings");
  const tCommon = useTranslations("onboarding.common");

  const accountId = searchParams.get("accountId");
  const businessId = searchParams.get("businessId");

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
    if (!accountId || !businessId) {
      router.push("/onboarding/choose-business");
    } else {
      setAccountId(accountId);
      setBusinessId(businessId);
    }
  }, [accountId, businessId, router, setAccountId, setBusinessId]);

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

      const response = await fetch(`/api/users/${user.uid}/accounts/${accountId}/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        throw new Error("Failed to save configuration");
      }

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

  if (!accountId || !businessId) {
    return null;
  }

  return (
    <OnboardingCard
      title={t("title")}
      description={t("description")}
      backButton={{ onClick: handleBack, disabled: saving }}
      nextButton={{
        label: saving ? tCommon("saving") : tCommon("finish"),
        onClick: handleFinish,
        disabled: saving,
      }}
    >
      <StarRatingConfigForm values={formData} onChange={handleFormChange} />
    </OnboardingCard>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AIResponseSettingsForm,
  AIResponseSettingsFormData,
} from "@/components/dashboard/businesses/forms/AIResponseSettingsForm";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultBusinessConfig } from "@/lib/utils/business-config";
import { ToneOfVoice, LanguageMode } from "@/lib/types";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateBusinessConfig } from "@/lib/actions/businesses.actions";

export default function OnboardingAISettings() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("onboarding.aiSettings");
  const tCommon = useTranslations("onboarding.common");

  const accountId = searchParams.get("accountId");
  const businessId = searchParams.get("businessId");

  const aiSettings = useOnboardingStore((state) => state.aiSettings);
  const setAccountId = useOnboardingStore((state) => state.setAccountId);
  const setBusinessId = useOnboardingStore((state) => state.setBusinessId);
  const setAISettings = useOnboardingStore((state) => state.setAISettings);

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AIResponseSettingsFormData>(() => {
    if (aiSettings) {
      return aiSettings;
    }
    const defaults = getDefaultBusinessConfig();
    return {
      toneOfVoice: defaults.toneOfVoice,
      languageMode: defaults.languageMode,
      allowedEmojis: defaults.allowedEmojis || [],
      maxSentences: defaults.maxSentences || 2,
      signature: defaults.signature || "",
    };
  });

  useEffect(() => {
    if (!accountId || !businessId) {
      router.push("/onboarding/choose-business");
    } else {
      setAccountId(accountId);
      setBusinessId(businessId);
    }
  }, [accountId, businessId, router, setAccountId, setBusinessId]);

  const handleFormChange = (
    field: keyof AIResponseSettingsFormData,
    value: string | string[] | number | ToneOfVoice | LanguageMode
  ) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    setAISettings(updatedData);
  };

  const handleBack = () => {
    router.push(`/onboarding/business-details?accountId=${accountId}&businessId=${businessId}`);
  };

  const handleNext = async () => {
    if (!user || !accountId || !businessId) return;

    try {
      setSaving(true);

      await updateBusinessConfig(user.id, accountId, businessId, {
        toneOfVoice: formData.toneOfVoice,
        languageMode: formData.languageMode,
        allowedEmojis: formData.allowedEmojis,
        maxSentences: formData.maxSentences,
        signature: formData.signature,
      });

      router.push(`/onboarding/star-ratings?accountId=${accountId}&businessId=${businessId}`);
    } catch (error) {
      console.error("Error saving AI settings:", error);
      toast.error(t("errorSaving"));
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
      backButton={{ onClick: handleBack, loading: saving, label: tCommon("back") }}
      nextButton={{ label: tCommon("next"), loadingLabel: tCommon("saving"), onClick: handleNext, loading: saving }}
    >
      <AIResponseSettingsForm values={formData} onChange={handleFormChange} />
    </OnboardingCard>
  );
}

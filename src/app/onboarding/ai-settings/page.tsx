"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AIResponseSettingsForm,
  AIResponseSettingsFormData,
} from "@/components/dashboard/businesses/forms/AIResponseSettingsForm";
import { getDefaultBusinessConfig } from "@/lib/utils/business-config";
import { ToneOfVoice, LanguageMode } from "@/lib/types";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";

export default function OnboardingAISettings() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const accountId = searchParams.get("accountId");
  const businessId = searchParams.get("businessId");

  const aiSettings = useOnboardingStore((state) => state.aiSettings);
  const setAccountId = useOnboardingStore((state) => state.setAccountId);
  const setBusinessId = useOnboardingStore((state) => state.setBusinessId);
  const setAISettings = useOnboardingStore((state) => state.setAISettings);

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

  const handleNext = () => {
    router.push(`/onboarding/star-ratings?accountId=${accountId}&businessId=${businessId}`);
  };

  if (!accountId || !businessId) {
    return null;
  }

  return (
    <OnboardingCard
      title="הגדרות תגובה AI"
      description="התאם אישית את סגנון ואופן התגובות האוטומטיות"
      backButton={{ onClick: handleBack }}
      nextButton={{ label: "הבא", onClick: handleNext }}
    >
      <AIResponseSettingsForm values={formData} onChange={handleFormChange} />
    </OnboardingCard>
  );
}

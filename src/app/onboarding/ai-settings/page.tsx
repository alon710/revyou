"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import {
  AIResponseSettingsForm,
  AIResponseSettingsFormData,
} from "@/components/dashboard/businesses/forms/AIResponseSettingsForm";
import { getDefaultBusinessConfig } from "@/lib/utils/business-config";
import { ToneOfVoice, LanguageMode } from "@/lib/types";
import { useOnboardingStore } from "@/lib/store/onboarding-store";

export default function OnboardingAISettings() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const accountId = searchParams.get("accountId");
  const businessId = searchParams.get("businessId");

  const onboardingStore = useOnboardingStore();

  const [formData, setFormData] = useState<AIResponseSettingsFormData>(() => {
    if (onboardingStore.aiSettings) {
      return onboardingStore.aiSettings;
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
      onboardingStore.setAccountId(accountId);
      onboardingStore.setBusinessId(businessId);
    }
  }, [accountId, businessId, router]);

  const handleFormChange = (
    field: keyof AIResponseSettingsFormData,
    value: string | string[] | number | ToneOfVoice | LanguageMode
  ) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    onboardingStore.setAISettings(updatedData);
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
    <div>
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>הגדרות תגובה AI</DashboardCardTitle>
          <DashboardCardDescription>התאם אישית את סגנון ואופן התגובות האוטומטיות</DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
          <AIResponseSettingsForm values={formData} onChange={handleFormChange} />

          <div className="flex gap-3">
            <Button onClick={handleBack} variant="outline" className="flex-1">
              הקודם
            </Button>
            <Button onClick={handleNext} className="flex-1">
              הבא
            </Button>
          </div>
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}

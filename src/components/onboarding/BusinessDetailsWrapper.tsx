"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/contexts/AuthContext";
import type { Business } from "@/lib/types";
import {
  BusinessDetailsForm,
  BusinessDetailsFormData,
} from "@/components/dashboard/businesses/forms/BusinessDetailsForm";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateBusinessConfig } from "@/lib/actions/businesses.actions";

interface BusinessDetailsWrapperProps {
  accountId: string;
  businessId: string;
  business: Business;
}

export function BusinessDetailsWrapper({ accountId, businessId, business }: BusinessDetailsWrapperProps) {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("onboarding.businessDetails");
  const tCommon = useTranslations("onboarding.common");

  const businessDetails = useOnboardingStore((state) => state.businessDetails);
  const setAccountId = useOnboardingStore((state) => state.setAccountId);
  const setBusinessId = useOnboardingStore((state) => state.setBusinessId);
  const setBusinessDetails = useOnboardingStore((state) => state.setBusinessDetails);

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BusinessDetailsFormData>(() => {
    if (businessDetails) {
      return businessDetails;
    }
    return {
      name: business.name || "",
      description: business.description || "",
      phoneNumber: business.phoneNumber || "",
    };
  });

  setAccountId(accountId);
  setBusinessId(businessId);

  const handleFormChange = (field: keyof BusinessDetailsFormData, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    setBusinessDetails(updatedData);
  };

  const handleBack = () => {
    router.push(`/onboarding/choose-business?accountId=${accountId}`);
  };

  const handleNext = async () => {
    if (!user || !accountId || !businessId) return;

    try {
      setSaving(true);

      await updateBusinessConfig(user.id, accountId, businessId, {
        name: formData.name,
        description: formData.description,
        phoneNumber: formData.phoneNumber,
      });

      router.push(`/onboarding/ai-settings?accountId=${accountId}&businessId=${businessId}`);
    } catch (error) {
      console.error("Error saving business details:", error);
      toast.error(t("errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingCard
      title={t("title")}
      description={t("description")}
      backButton={{ onClick: handleBack, loading: saving, label: tCommon("back") }}
      nextButton={{ label: tCommon("next"), loadingLabel: tCommon("saving"), onClick: handleNext, loading: saving }}
    >
      <BusinessDetailsForm values={formData} onChange={handleFormChange} businessNamePlaceholder={business.name} />
    </OnboardingCard>
  );
}

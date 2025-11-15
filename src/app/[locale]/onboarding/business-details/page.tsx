"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/routing";
import type { Business } from "@/lib/types";
import { Loading } from "@/components/ui/loading";
import {
  BusinessDetailsForm,
  BusinessDetailsFormData,
} from "@/components/dashboard/businesses/forms/BusinessDetailsForm";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getBusiness, updateBusinessConfig } from "@/lib/actions/businesses.actions";

export default function OnboardingBusinessDetails() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("onboarding.businessDetails");
  const tCommon = useTranslations("onboarding.common");

  const accountId = searchParams.get("accountId");
  const businessId = searchParams.get("businessId");

  const businessDetails = useOnboardingStore((state) => state.businessDetails);
  const setAccountId = useOnboardingStore((state) => state.setAccountId);
  const setBusinessId = useOnboardingStore((state) => state.setBusinessId);
  const setBusinessDetails = useOnboardingStore((state) => state.setBusinessDetails);

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BusinessDetailsFormData>(() => {
    if (businessDetails) {
      return businessDetails;
    }
    return {
      name: "",
      description: "",
      phoneNumber: "",
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

  const fetchBusiness = useCallback(async () => {
    if (!user || !accountId || !businessId) return;

    try {
      setLoading(true);

      const biz = await getBusiness(user.uid, accountId, businessId);
      setBusiness(biz);

      if (businessDetails) {
        setFormData(businessDetails);
      } else {
        setFormData({
          name: biz.config?.name || "",
          description: biz.config?.description || "",
          phoneNumber: biz.config?.phoneNumber || "",
        });
      }
    } catch (error) {
      console.error("Error fetching business:", error);
      router.push("/onboarding/choose-business");
    } finally {
      setLoading(false);
    }
  }, [user, accountId, businessId, router, businessDetails]);

  useEffect(() => {
    if (accountId && businessId) {
      fetchBusiness();
    }
  }, [accountId, businessId, fetchBusiness]);

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

      await updateBusinessConfig(user.uid, accountId, businessId, {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="md" />
      </div>
    );
  }

  if (!business || !accountId || !businessId) {
    return null;
  }

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

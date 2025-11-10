"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Business } from "@/lib/types";
import { Loading } from "@/components/ui/loading";
import {
  BusinessDetailsForm,
  BusinessDetailsFormData,
} from "@/components/dashboard/businesses/forms/BusinessDetailsForm";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";

export default function OnboardingBusinessDetails() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const accountId = searchParams.get("accountId");
  const businessId = searchParams.get("businessId");

  const businessDetails = useOnboardingStore((state) => state.businessDetails);
  const setAccountId = useOnboardingStore((state) => state.setAccountId);
  const setBusinessId = useOnboardingStore((state) => state.setBusinessId);
  const setBusinessDetails = useOnboardingStore((state) => state.setBusinessDetails);

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
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

      const response = await fetch(`/api/users/${user.uid}/accounts/${accountId}/businesses/${businessId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch business");
      }

      const { business: biz } = await response.json();
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
    router.push(`/onboarding/ai-settings?accountId=${accountId}&businessId=${businessId}`);
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
      title="פרטי העסק"
      description="הגדר את פרטי העסק הבסיסיים שישמשו ביצירת תגובות AI"
      backButton={{ onClick: handleBack }}
      nextButton={{ label: "הבא", onClick: handleNext }}
    >
      <BusinessDetailsForm values={formData} onChange={handleFormChange} businessNamePlaceholder={business.name} />
    </OnboardingCard>
  );
}

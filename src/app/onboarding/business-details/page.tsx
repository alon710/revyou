"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Business } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { Loading } from "@/components/ui/loading";
import {
  BusinessDetailsForm,
  BusinessDetailsFormData,
} from "@/components/dashboard/businesses/forms/BusinessDetailsForm";
import { toast } from "sonner";
import { useOnboardingStore } from "@/lib/store/onboarding-store";

export default function OnboardingBusinessDetails() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const accountId = searchParams.get("accountId");
  const businessId = searchParams.get("businessId");

  const onboardingStore = useOnboardingStore();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<BusinessDetailsFormData>(() => {
    if (onboardingStore.businessDetails) {
      return onboardingStore.businessDetails;
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
      onboardingStore.setAccountId(accountId);
      onboardingStore.setBusinessId(businessId);
    }
  }, [accountId, businessId, router]);

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

      if (onboardingStore.businessDetails) {
        setFormData(onboardingStore.businessDetails);
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
  }, [user, accountId, businessId, router]);

  useEffect(() => {
    if (accountId && businessId) {
      fetchBusiness();
    }
  }, [accountId, businessId, fetchBusiness]);

  const handleFormChange = (field: keyof BusinessDetailsFormData, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    onboardingStore.setBusinessDetails(updatedData);
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
    <div>
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>פרטי העסק</DashboardCardTitle>
          <DashboardCardDescription>הגדר את פרטי העסק הבסיסיים שישמשו ביצירת תגובות AI</DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
          <BusinessDetailsForm values={formData} onChange={handleFormChange} businessNamePlaceholder={business.name} />

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

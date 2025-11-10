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

export default function OnboardingBusinessDetails() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const accountId = searchParams.get("accountId");
  const businessId = searchParams.get("businessId");

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<BusinessDetailsFormData>({
    name: "",
    description: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (!accountId || !businessId) {
      router.push("/onboarding/choose-business");
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

      setFormData({
        name: biz.config?.name || "",
        description: biz.config?.description || "",
        phoneNumber: biz.config?.phoneNumber || "",
      });
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    sessionStorage.setItem("onboarding-business-details", JSON.stringify(formData));
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

          <Button onClick={handleNext} className="w-full">
            הבא
          </Button>
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}

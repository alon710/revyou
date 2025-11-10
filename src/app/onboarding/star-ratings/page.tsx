"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import {
  StarRatingConfigForm,
  StarRatingConfigFormData,
} from "@/components/dashboard/businesses/forms/StarRatingConfigForm";
import { getDefaultBusinessConfig } from "@/lib/utils/business-config";
import { toast } from "sonner";
import type { BusinessConfig } from "@/lib/types";
import { useOnboardingStore } from "@/lib/store/onboarding-store";

export default function OnboardingStarRatings() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const accountId = searchParams.get("accountId");
  const businessId = searchParams.get("businessId");

  const onboardingStore = useOnboardingStore();

  const [formData, setFormData] = useState<StarRatingConfigFormData>(() => {
    if (onboardingStore.starRatings) {
      return onboardingStore.starRatings;
    }
    const defaults = getDefaultBusinessConfig();
    return defaults.starConfigs;
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accountId || !businessId) {
      router.push("/onboarding/choose-business");
    } else {
      onboardingStore.setAccountId(accountId);
      onboardingStore.setBusinessId(businessId);
    }
  }, [accountId, businessId, router]);

  const handleFormChange = (rating: 1 | 2 | 3 | 4 | 5, config: { autoReply: boolean; customInstructions: string }) => {
    const updatedData = {
      ...formData,
      [rating]: config,
    };
    setFormData(updatedData);

    onboardingStore.setStarRatings(updatedData);
  };

  const handleBack = () => {
    router.push(`/onboarding/ai-settings?accountId=${accountId}&businessId=${businessId}`);
  };

  const handleFinish = async () => {
    if (!user || !accountId || !businessId) return;

    try {
      setSaving(true);

      const config = onboardingStore.getCombinedConfig();

      const response = await fetch(`/api/users/${user.uid}/accounts/${accountId}/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        throw new Error("Failed to save configuration");
      }

      onboardingStore.reset();

      toast.success("ההגדרות נשמרו בהצלחה!");

      router.push("/dashboard/home");
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error("לא ניתן לשמור את ההגדרות");
    } finally {
      setSaving(false);
    }
  };

  if (!accountId || !businessId) {
    return null;
  }

  return (
    <div>
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>הגדרות לפי דירוג כוכבים</DashboardCardTitle>
          <DashboardCardDescription>התאם אישית את התגובות האוטומטיות לפי רמת הדירוג</DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
          <StarRatingConfigForm values={formData} onChange={handleFormChange} />

          <div className="flex gap-3">
            <Button onClick={handleBack} variant="outline" className="flex-1" disabled={saving}>
              הקודם
            </Button>
            <Button onClick={handleFinish} className="flex-1" disabled={saving}>
              {saving ? "שומר..." : "סיים"}
            </Button>
          </div>
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}

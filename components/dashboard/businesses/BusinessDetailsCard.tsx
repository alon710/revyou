"use client";

import { Business, BusinessConfig } from "@/types/database";
import { updateBusinessConfig } from "@/lib/firebase/business-config";
import { updateBusiness } from "@/lib/firebase/business";
import BusinessIdentitySection from "@/components/dashboard/businesses/BusinessIdentitySection";
import AIResponseSettingsSection from "@/components/dashboard/businesses/AIResponseSettingsSection";
import StarRatingConfigSection from "@/components/dashboard/businesses/StarRatingConfigSection";
import NotificationPreferencesSection from "@/components/dashboard/businesses/NotificationPreferencesSection";
import { useBusiness } from "@/contexts/BusinessContext";

interface BusinessDetailsCardProps {
  business: Business;
  userId: string;
  loading?: boolean;
  onUpdate: () => Promise<void>;
}

export default function BusinessDetailsCard({
  business,
  userId,
  loading = false,
  onUpdate,
}: BusinessDetailsCardProps) {
  const { currentAccount } = useBusiness();

  const handleSaveSection = async (partialConfig: Partial<BusinessConfig>) => {
    if (!currentAccount) {
      console.error("No current account");
      return;
    }

    try {
      await updateBusinessConfig(
        userId,
        currentAccount.id,
        business.id,
        partialConfig
      );
      await onUpdate();
    } catch (error) {
      console.error("Error saving config:", error);
      throw error;
    }
  };

  const handleSaveStarConfigs = async (
    starConfigs: BusinessConfig["starConfigs"]
  ) => {
    await handleSaveSection({ starConfigs });
  };

  const handleSaveNotificationPreferences = async (data: {
    emailOnNewReview: boolean;
  }) => {
    if (!currentAccount) {
      console.error("No current account");
      return;
    }

    try {
      await updateBusiness(userId, currentAccount.id, business.id, data);
      await onUpdate();
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <BusinessIdentitySection
        config={business.config}
        business={business}
        loading={loading}
        onSave={handleSaveSection}
      />

      <AIResponseSettingsSection
        config={business.config}
        loading={loading}
        onSave={handleSaveSection}
      />

      <StarRatingConfigSection
        starConfigs={business.config.starConfigs}
        loading={loading}
        onSave={handleSaveStarConfigs}
      />

      <NotificationPreferencesSection
        business={business}
        loading={loading}
        onSave={handleSaveNotificationPreferences}
      />
    </div>
  );
}

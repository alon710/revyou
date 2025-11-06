"use client";

import { Business, BusinessConfig } from "../../../../types/database";
import { updateBusinessConfig } from "@/lib/firebase/business-config";
import { updateBusiness } from "@/lib/firebase/business";
import BusinessIdentitySection from "@/components/dashboard/businesses/BusinessIdentitySection";
import AIResponseSettingsSection from "@/components/dashboard/businesses/AIResponseSettingsSection";
import StarRatingConfigSection from "@/components/dashboard/businesses/StarRatingConfigSection";
import NotificationPreferencesSection from "@/components/dashboard/businesses/NotificationPreferencesSection";

interface BusinessDetailsCardProps {
  business: Business;
  accountId: string;
  userId: string;
  loading?: boolean;
  onUpdate: () => Promise<void>;
}

export default function BusinessDetailsCard({
  business,
  accountId,
  userId,
  loading = false,
  onUpdate,
}: BusinessDetailsCardProps) {
  const handleSaveSection = async (partialConfig: Partial<BusinessConfig>) => {
    try {
      await updateBusinessConfig(userId, accountId, business.id, partialConfig);
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
    try {
      await updateBusiness(userId, accountId, business.id, data);
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

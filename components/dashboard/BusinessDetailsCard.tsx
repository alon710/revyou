"use client";

import { Business, BusinessConfig } from "@/types/database";
import {
  BusinessIdentitySection,
  AIResponseSettingsSection,
  StarRatingConfigSection,
  NotificationPreferencesSection,
} from "@/components/dashboard/business-config";
import { updateBusinessConfig } from "@/lib/firebase/business-config";
import { updateBusiness } from "@/lib/firebase/businesses";

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
  const handleSaveSection = async (partialConfig: Partial<BusinessConfig>) => {
    try {
      await updateBusinessConfig(userId, business.id, partialConfig);
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
      await updateBusiness(userId, business.id, data);
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

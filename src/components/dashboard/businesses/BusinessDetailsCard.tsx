"use client";

import { Business, BusinessConfig } from "@/lib/types";
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
      const response = await fetch(
        `/api/users/${userId}/accounts/${accountId}/businesses/${business.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config: partialConfig }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update config");
      }

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
      const response = await fetch(
        `/api/users/${userId}/accounts/${accountId}/businesses/${business.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update preferences");
      }

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

"use client";

import { Location, LocationConfig } from "@/types/database";
import { updateLocationConfig } from "@/lib/firebase/location-config";
import { updateLocation } from "@/lib/firebase/locations";
import LocationIdentitySection from "@/components/dashboard/locations/LocationIdentitySection";
import AIResponseSettingsSection from "@/components/dashboard/locations/AIResponseSettingsSection";
import StarRatingConfigSection from "@/components/dashboard/locations/StarRatingConfigSection";
import NotificationPreferencesSection from "@/components/dashboard/locations/NotificationPreferencesSection";

interface LocationDetailsCardProps {
  location: Location;
  userId: string;
  loading?: boolean;
  onUpdate: () => Promise<void>;
}

export default function LocationDetailsCard({
  location,
  userId,
  loading = false,
  onUpdate,
}: LocationDetailsCardProps) {
  const handleSaveSection = async (partialConfig: Partial<LocationConfig>) => {
    try {
      await updateLocationConfig(userId, location.id, partialConfig);
      await onUpdate();
    } catch (error) {
      console.error("Error saving config:", error);
      throw error;
    }
  };

  const handleSaveStarConfigs = async (
    starConfigs: LocationConfig["starConfigs"]
  ) => {
    await handleSaveSection({ starConfigs });
  };

  const handleSaveNotificationPreferences = async (data: {
    emailOnNewReview: boolean;
  }) => {
    try {
      await updateLocation(userId, location.id, data);
      await onUpdate();
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <LocationIdentitySection
        config={location.config}
        location={location}
        loading={loading}
        onSave={handleSaveSection}
      />

      <AIResponseSettingsSection
        config={location.config}
        loading={loading}
        onSave={handleSaveSection}
      />

      <StarRatingConfigSection
        starConfigs={location.config.starConfigs}
        loading={loading}
        onSave={handleSaveStarConfigs}
      />

      <NotificationPreferencesSection
        location={location}
        loading={loading}
        onSave={handleSaveNotificationPreferences}
      />
    </div>
  );
}

"use client";

import { Business } from "@/lib/types";
import BusinessIdentitySection from "@/components/dashboard/businesses/BusinessIdentitySection";
import AIResponseSettingsSection from "@/components/dashboard/businesses/AIResponseSettingsSection";
import StarRatingConfigSection from "@/components/dashboard/businesses/StarRatingConfigSection";
import { updateBusinessConfig } from "@/lib/actions/businesses.actions";

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
  const handleSaveSection = async (partialData: Partial<Business>) => {
    try {
      await updateBusinessConfig(userId, accountId, business.id, partialData);
      await onUpdate();
    } catch (error) {
      console.error("Error saving config:", error);
      throw error;
    }
  };

  const handleSaveStarConfigs = async (starConfigs: Business["starConfigs"]) => {
    await handleSaveSection({ starConfigs });
  };

  return (
    <div className="space-y-6">
      <BusinessIdentitySection business={business} loading={loading} onSave={handleSaveSection} />

      <AIResponseSettingsSection business={business} loading={loading} onSave={handleSaveSection} />

      <StarRatingConfigSection starConfigs={business.starConfigs} loading={loading} onSave={handleSaveStarConfigs} />
    </div>
  );
}

"use client";

import { Business, BusinessConfig } from "@/types/database";
import {
  BusinessIdentitySection,
  AIResponseSettingsSection,
  StarRatingConfigSection,
} from "./business-config";
import { toast } from "sonner";
import { updateBusinessConfig } from "@/lib/firebase/businesses";

interface BusinessDetailsCardProps {
  business: Business;
  loading?: boolean;
  onUpdate: () => Promise<void>;
}

export default function BusinessDetailsCard({
  business,
  loading = false,
  onUpdate,
}: BusinessDetailsCardProps) {
  const handleSaveSection = async (partialConfig: Partial<BusinessConfig>) => {
    try {
      await updateBusinessConfig(business.id, partialConfig);
      toast.success("ההגדרות נשמרו בהצלחה");
      await onUpdate();
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("לא ניתן לשמור את ההגדרות");
      throw error;
    }
  };

  const handleSaveStarConfigs = async (
    starConfigs: BusinessConfig["starConfigs"]
  ) => {
    await handleSaveSection({ starConfigs });
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
    </div>
  );
}

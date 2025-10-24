"use client";

import { useState } from "react";
import {
  Business,
  BusinessConfig,
  StarConfig,
  DEFAULT_PROMPT_TEMPLATE,
} from "@/types/database";
import {
  BusinessIdentitySection,
  AIResponseSettingsSection,
  StarRatingConfigSection,
  PromptTemplateSection,
} from "./business-config";

interface BusinessDetailsCardProps {
  variant: "display" | "edit";
  business: Business;
  onSave?: (config: BusinessConfig) => Promise<void>;
  loading?: boolean;
  onSavingChange?: (saving: boolean) => void;
}

export default function BusinessDetailsCard({
  variant,
  business,
  onSave,
  loading = false,
  onSavingChange,
}: BusinessDetailsCardProps) {
  const [config, setConfig] = useState<BusinessConfig>({
    ...business.config,
    promptTemplate: business.config.promptTemplate || DEFAULT_PROMPT_TEMPLATE,
  });

  const isEditMode = variant === "edit";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;

    try {
      onSavingChange?.(true);
      await onSave(config);
    } finally {
      onSavingChange?.(false);
    }
  };

  const updateConfig = (updates: Partial<BusinessConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const updateStarConfig = (
    rating: 1 | 2 | 3 | 4 | 5,
    field: keyof StarConfig,
    value: string | boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      starConfigs: {
        ...prev.starConfigs,
        [rating]: {
          ...prev.starConfigs[rating],
          [field]: value,
        },
      },
    }));
  };

  const handleResetTemplate = () => {
    setConfig({ ...config, promptTemplate: DEFAULT_PROMPT_TEMPLATE });
  };

  const FormWrapper = isEditMode ? "form" : "div";
  const formProps = isEditMode ? { onSubmit: handleSubmit, id: "business-config-form" } : {};

  return (
    <FormWrapper {...formProps} className="space-y-6 max-w-4xl">
      <BusinessIdentitySection
        variant={variant}
        config={config}
        business={business}
        loading={loading}
        onChange={updateConfig}
      />

      <AIResponseSettingsSection
        variant={variant}
        config={config}
        loading={loading}
        onChange={updateConfig}
      />

      <StarRatingConfigSection
        variant={variant}
        starConfigs={config.starConfigs}
        loading={loading}
        onChange={updateStarConfig}
      />

      <PromptTemplateSection
        variant={variant}
        promptTemplate={config.promptTemplate}
        loading={loading}
        onChange={(template) => setConfig({ ...config, promptTemplate: template })}
        onReset={handleResetTemplate}
      />
    </FormWrapper>
  );
}

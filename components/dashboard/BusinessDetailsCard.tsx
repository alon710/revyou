"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface BusinessDetailsCardProps {
  variant: "display" | "edit";
  business: Business;
  onSave?: (config: BusinessConfig) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  onSavingChange?: (saving: boolean) => void;
  saving?: boolean;
}

export default function BusinessDetailsCard({
  variant,
  business,
  onSave,
  onCancel,
  loading = false,
  onSavingChange,
  saving = false,
}: BusinessDetailsCardProps) {
  const [config, setConfig] = useState<BusinessConfig>({
    ...business.config,
    promptTemplate: business.config.promptTemplate || DEFAULT_PROMPT_TEMPLATE,
    maxSentences: business.config.maxSentences || 2,
    allowedEmojis: business.config.allowedEmojis || [],
    signature: business.config.signature || "",
  });

  const isEditMode = variant === "edit";

  useEffect(() => {
    setConfig({
      ...business.config,
      promptTemplate: business.config.promptTemplate || DEFAULT_PROMPT_TEMPLATE,
      maxSentences: business.config.maxSentences || 2,
      allowedEmojis: business.config.allowedEmojis || [],
      signature: business.config.signature || "",
    });
  }, [business, variant]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("📋 handleSubmit called in BusinessDetailsCard");
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
  const formProps = isEditMode
    ? { onSubmit: handleSubmit, id: "business-config-form" }
    : {};

  return (
    <>
      <FormWrapper {...formProps} className="space-y-6">
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
          onChange={(template) =>
            setConfig({ ...config, promptTemplate: template })
          }
          onReset={handleResetTemplate}
          business={business}
          config={config}
        />

        {isEditMode && (
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              size="default"
            >
              <X className="ml-2 h-5 w-5" />
              ביטול
            </Button>
            <Button type="submit" disabled={saving || loading} size="default">
              <Save className="ml-2 h-5 w-5" />
              שמור שינויים
            </Button>
          </div>
        )}
      </FormWrapper>
    </>
  );
}

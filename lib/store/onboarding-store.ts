import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BusinessConfig } from "@/lib/types";
import type { BusinessDetailsFormData } from "@/components/dashboard/businesses/forms/BusinessDetailsForm";
import type { AIResponseSettingsFormData } from "@/components/dashboard/businesses/forms/AIResponseSettingsForm";
import type { StarRatingConfigFormData } from "@/components/dashboard/businesses/forms/StarRatingConfigForm";
import { getDefaultBusinessConfig } from "@/lib/utils/business-config";

interface OnboardingState {
  accountId: string | null;
  businessId: string | null;

  businessDetails: BusinessDetailsFormData | null;
  aiSettings: AIResponseSettingsFormData | null;
  starRatings: StarRatingConfigFormData | null;

  setAccountId: (accountId: string) => void;
  setBusinessId: (businessId: string) => void;
  setBusinessDetails: (data: BusinessDetailsFormData) => void;
  setAISettings: (data: AIResponseSettingsFormData) => void;
  setStarRatings: (data: StarRatingConfigFormData) => void;

  reset: () => void;
  getCombinedConfig: () => Partial<BusinessConfig>;
}

const getInitialState = () => {
  return {
    accountId: null,
    businessId: null,
    businessDetails: null,
    aiSettings: null,
    starRatings: null,
  };
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      setAccountId: (accountId: string) => {
        set({ accountId });
      },

      setBusinessId: (businessId: string) => {
        set({ businessId });
      },

      setBusinessDetails: (data: BusinessDetailsFormData) => {
        set({ businessDetails: data });
      },

      setAISettings: (data: AIResponseSettingsFormData) => {
        set({ aiSettings: data });
      },

      setStarRatings: (data: StarRatingConfigFormData) => {
        set({ starRatings: data });
      },

      reset: () => {
        set(getInitialState());
      },

      getCombinedConfig: () => {
        const state = get();
        const defaults = getDefaultBusinessConfig();

        const config: Partial<BusinessConfig> = {
          name: state.businessDetails?.name ?? defaults.name,
          description: state.businessDetails?.description ?? defaults.description,
          phoneNumber: state.businessDetails?.phoneNumber ?? defaults.phoneNumber,
          toneOfVoice: state.aiSettings?.toneOfVoice ?? defaults.toneOfVoice,
          languageMode: state.aiSettings?.languageMode ?? defaults.languageMode,
          allowedEmojis: state.aiSettings?.allowedEmojis ?? defaults.allowedEmojis,
          maxSentences: state.aiSettings?.maxSentences ?? defaults.maxSentences,
          signature: state.aiSettings?.signature ?? defaults.signature,
          starConfigs: state.starRatings ?? defaults.starConfigs,
        };

        return config;
      },
    }),
    {
      name: "bottie-onboarding-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

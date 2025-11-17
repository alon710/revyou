import type { Business as DrizzleBusiness, BusinessInsert } from "@/lib/db/schema";

export interface StarConfig {
  customInstructions: string;
  autoReply: boolean;
}

export interface BusinessConfig {
  name: string;
  description?: string;
  phoneNumber?: string;

  toneOfVoice: ToneOfVoice;
  useEmojis: boolean;
  languageMode: LanguageMode;
  languageInstructions?: string;
  maxSentences?: number;
  allowedEmojis?: string[];
  signature?: string;

  starConfigs: {
    1: StarConfig;
    2: StarConfig;
    3: StarConfig;
    4: StarConfig;
    5: StarConfig;
  };
}

export type Business = DrizzleBusiness & {
  config: BusinessConfig;
};

export type BusinessCreate = Omit<BusinessInsert, "id" | "connected" | "connectedAt"> & {
  config: BusinessConfig;
};

export type BusinessUpdate = Partial<
  Pick<BusinessInsert, "name" | "phoneNumber" | "websiteUrl" | "description" | "photoUrl" | "connected">
> & {
  config?: Partial<BusinessConfig>;
};

export type ToneOfVoice = "friendly" | "formal" | "humorous" | "professional";
export type LanguageMode = "hebrew" | "english" | "auto-detect";

export interface GoogleBusinessProfileBusiness {
  accountId: string;
  id: string;
  name: string;
  address: string;
  phoneNumber: string | null;
  websiteUrl: string | null;
  mapsUrl: string | null;
  description: string | null;
  photoUrl: string | null;
}

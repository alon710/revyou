import { Timestamp, WithFieldValue, PartialWithFieldValue } from "firebase/firestore";

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

export interface BusinessCreate {
  userId: string;
  accountId: string;
  googleBusinessId: string;
  name: string;
  address: string;
  phoneNumber: string | null;
  websiteUrl: string | null;
  mapsUrl: string | null;
  description: string | null;
  photoUrl: string | null;
  emailOnNewReview: boolean;
  config: BusinessConfig;
}

export interface Business extends BusinessCreate {
  id: string;
  connected: boolean;
  connectedAt: Timestamp;
}

export interface BusinessUpdate {
  name?: string;
  phoneNumber?: string | null;
  websiteUrl?: string | null;
  description?: string | null;
  photoUrl?: string | null;
  emailOnNewReview?: boolean;
  config?: Partial<BusinessConfig>;
  connected?: boolean;
}

export type BusinessCreateInput = WithFieldValue<BusinessCreate>;
export type BusinessUpdateInput = PartialWithFieldValue<BusinessUpdate>;
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

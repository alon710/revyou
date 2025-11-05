import { Timestamp } from "firebase/firestore";

export type ToneOfVoice = "friendly" | "formal" | "humorous" | "professional";
export type LanguageMode = "hebrew" | "english" | "auto-detect";

export type ReplyStatus = "pending" | "rejected" | "posted" | "failed";

export interface Account {
  id: string;
  email: string;
  accountName: string;
  googleRefreshToken: string;
  connectedAt: Timestamp;
  lastSynced?: Timestamp;
}

export interface AccountWithBusinesses extends Account {
  businesses: Business[];
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  stripeId?: string;
  stripeLink?: string;
  selectedAccountId?: string;
  selectedBusinessId?: string;
  onboardingCompleted?: boolean;
}

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

export interface Business {
  id: string;
  googleBusinessId: string;
  name: string;
  address: string;
  phoneNumber: string | null;
  websiteUrl: string | null;
  mapsUrl: string | null;
  description: string | null;
  photoUrl: string | null;
  connected: boolean;
  connectedAt: Timestamp;
  config: BusinessConfig;
  emailOnNewReview: boolean;
}

export interface Review {
  id: string;
  googleReviewId: string;
  name: string;
  photoUrl?: string;
  rating: number;
  text?: string;
  date: Timestamp;
  receivedAt: Timestamp;

  aiReply?: string;
  aiReplyGeneratedAt?: Timestamp;
  replyStatus: ReplyStatus;

  postedReply?: string | null;
  postedAt?: Timestamp | null;
  postedBy?: string | null;
}

export { DEFAULT_BUSINESS_PROMPT_TEMPLATE } from "@/lib/ai/prompts/template";

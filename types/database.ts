import { Timestamp } from "firebase/firestore";

export type ToneOfVoice = "friendly" | "formal" | "humorous" | "professional";
export type LanguageMode = "hebrew" | "english" | "auto-detect";

export type ReplyStatus = "pending" | "rejected" | "posted" | "failed";

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Timestamp;
  stripeCustomerId?: string;
  googleRefreshToken?: string;
  selectedBusinessId?: string;
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
  phoneNumber?: string;
  websiteUrl?: string;
  mapsUrl?: string;
  description?: string;
  photoUrl?: string;
}

export interface Business {
  id: string;
  googleAccountId: string;
  googleBusinessId: string;
  name: string;
  address: string;
  phoneNumber?: string;
  websiteUrl?: string;
  mapsUrl?: string;
  description?: string;
  photoUrl?: string;
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

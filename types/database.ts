import { Timestamp } from "firebase/firestore";

export type ToneOfVoice = "friendly" | "formal" | "humorous" | "professional";

export type LanguageMode =
  | "hebrew"
  | "english"
  | "auto-detect"
  | "match-reviewer";

export type ReplyStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "posted"
  | "failed";

export type SubscriptionStatus = "active" | "canceled" | "past_due";

export interface User {
  uid: string;
  email: string;
  createdAt: Timestamp;
  stripeCustomerId?: string;
  googleRefreshToken?: string;
  selectedBusinessId?: string;
  notificationPreferences?: {
    emailOnNewReview: boolean;
  };
}

export interface StarConfig {
  customInstructions: string;
  autoReply: boolean;
}

export interface BusinessConfig {
  businessName?: string;
  businessDescription: string;
  businessPhone?: string;

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

export interface Business {
  id: string;
  googleAccountId: string;
  googleLocationId: string;
  name: string;
  address: string;
  photoUrl?: string;
  connected: boolean;
  connectedAt: Timestamp;
  config: BusinessConfig;
  notificationsEnabled?: boolean;
}

export interface Review {
  id: string;
  googleReviewId: string;
  reviewerName: string;
  reviewerPhotoUrl?: string;
  rating: number;
  reviewText: string;
  reviewDate: Timestamp;
  receivedAt: Timestamp;

  aiReply?: string;
  aiReplyGeneratedAt?: Timestamp;
  replyStatus: ReplyStatus;

  postedReply?: string | null;
  postedAt?: Timestamp | null;
  postedBy?: string | null;

  wasEdited: boolean;
  editedReply?: string | null;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
}

export { DEFAULT_BUSINESS_PROMPT_TEMPLATE as DEFAULT_PROMPT_TEMPLATE } from "@/lib/ai/prompt-templates";

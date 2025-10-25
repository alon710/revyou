import { Timestamp } from "firebase/firestore";
import type { SubscriptionTier } from "@/lib/validation/database";

export type { SubscriptionTier };

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
  displayName: string;
  photoURL: string;
  createdAt: Timestamp;
  subscriptionTier: SubscriptionTier;
  stripeCustomerId?: string;
  googleRefreshToken?: string; // encrypted
  selectedBusinessId?: string; // Currently selected business (persisted in Firestore)
  notificationPreferences?: {
    emailOnNewReview: boolean;
  };
}

export interface StarConfig {
  customInstructions: string;
  autoReply: boolean;
}

export interface BusinessConfig {
  // Business Identity (can override Google Business data)
  businessName?: string; // Optional override for business name
  businessDescription: string; // Description of the business
  businessPhone?: string; // Contact phone for negative reviews

  // AI Response Configuration
  toneOfVoice: ToneOfVoice; // Tone of AI responses
  useEmojis: boolean; // Whether to use emojis
  languageMode: LanguageMode; // Language mode for responses
  languageInstructions?: string; // Custom language selection (overrides languageMode)
  maxSentences?: number; // Max sentences in reply (default: 2)
  allowedEmojis?: string[]; // List of allowed emojis (e.g., ["🥂", "✨", "🙏"])
  signature?: string; // Business signature line (e.g., "צוות חמישים ושמונה")

  // Star-specific Configuration
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
  userId: string;
  googleAccountId: string;
  googleLocationId: string;
  name: string;
  address: string;
  photoUrl?: string;
  connected: boolean;
  connectedAt: Timestamp;
  config: BusinessConfig;
  notificationsEnabled?: boolean; // Pub/Sub notifications status
}

export interface Review {
  id: string;
  businessId: string;
  googleReviewId: string;
  reviewerName: string;
  reviewerPhotoUrl?: string;
  rating: number; // 1-5
  reviewText: string;
  reviewDate: Timestamp;
  receivedAt: Timestamp;

  // AI Reply
  aiReply?: string;
  aiReplyGeneratedAt?: Timestamp;
  replyStatus: ReplyStatus;

  // Posted reply
  postedReply?: string | null;
  postedAt?: Timestamp | null;
  postedBy?: string | null;

  // If user edited the AI reply
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

// Re-export default prompt template from centralized location
export { DEFAULT_BUSINESS_PROMPT_TEMPLATE as DEFAULT_PROMPT_TEMPLATE } from "@/lib/ai/prompt-templates";

// Subscription limits by tier
export const SUBSCRIPTION_LIMITS = {
  free: {
    businesses: 1,
    reviewsPerMonth: 5,
    autoPost: false,
    requireApproval: true,
  },
  basic: {
    businesses: 3,
    reviewsPerMonth: 250,
    autoPost: true,
    requireApproval: false,
  },
  professional: {
    businesses: 10,
    reviewsPerMonth: 1000,
    autoPost: true,
    requireApproval: false,
  },
} as const;

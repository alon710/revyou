import { Timestamp } from "firebase/firestore";

export type SubscriptionTier = "free" | "basic" | "pro" | "enterprise";

export type ToneOfVoice = "friendly" | "formal" | "humorous" | "professional";

export type LanguageMode = "hebrew" | "english" | "auto-detect" | "match-reviewer";

export type ReplyStatus = "pending" | "approved" | "rejected" | "posted" | "failed";

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
}

export interface StarConfig {
  customInstructions: string;
  enabled: boolean;
}

export interface BusinessConfig {
  businessDescription: string;
  toneOfVoice: ToneOfVoice;
  useEmojis: boolean;
  languageMode: LanguageMode;
  autoPost: boolean;
  requireApproval: boolean;
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

// Subscription limits by tier
export const SUBSCRIPTION_LIMITS = {
  free: {
    businesses: 1,
    reviewsPerMonth: 10,
    autoPost: false,
    requireApproval: true,
  },
  basic: {
    businesses: 3,
    reviewsPerMonth: 100,
    autoPost: true,
    requireApproval: false,
  },
  pro: {
    businesses: 10,
    reviewsPerMonth: 500,
    autoPost: true,
    requireApproval: false,
  },
  enterprise: {
    businesses: Infinity,
    reviewsPerMonth: Infinity,
    autoPost: true,
    requireApproval: false,
  },
} as const;

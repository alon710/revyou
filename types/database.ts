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
  selectedBusinessId?: string; // Currently selected business (persisted in Firestore)
  notificationPreferences?: {
    emailOnNewReview: boolean;
    emailOnFailedPost: boolean;
  };
}

export interface StarConfig {
  customInstructions: string;
  enabled: boolean;
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

  // Prompt Template (required for each business)
  promptTemplate: string; // Custom AI prompt template for this business

  // Automation Settings
  autoPost: boolean; // Auto-post replies without approval
  requireApproval: boolean; // Require manual approval before posting

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

// Default prompt template for new businesses
export const DEFAULT_PROMPT_TEMPLATE = `אתה עוזר AI שכותב תגובות לביקורות עסקיות ב-Google Business Profile.

מידע על העסק:
- שם העסק: {{BUSINESS_NAME}}
- תיאור העסק: {{BUSINESS_DESCRIPTION}}
- טלפון העסק: {{BUSINESS_PHONE}}

מידע על הביקורת:
- שם המבקר: {{REVIEWER_NAME}}
- דירוג: {{RATING}} כוכבים
- טקסט הביקורת: {{REVIEW_TEXT}}

הנחיות לתגובה:
- טון התגובה: {{TONE}}
- {{LANGUAGE_INSTRUCTION}}
- מספר משפטים מקסימלי: {{MAX_SENTENCES}}
- חתימה: {{SIGNATURE}}
- {{EMOJI_INSTRUCTIONS}}

הנחיות ספציפיות לדירוג זה:
{{CUSTOM_INSTRUCTIONS}}

כתוב תגובה מקצועית, אמפתית ומותאמת אישית לביקורת.`;

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

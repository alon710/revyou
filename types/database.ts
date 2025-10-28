import { Timestamp } from "firebase/firestore";

export type ToneOfVoice = "friendly" | "formal" | "humorous" | "professional";
export type LanguageMode = "hebrew" | "english" | "auto-detect";

export type ReplyStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "posted"
  | "failed";

export interface User {
  uid: string;
  email: string;
  createdAt: Timestamp;
  stripeCustomerId?: string;
  googleRefreshToken?: string;
  selectedLocationId?: string;
}

export interface StarConfig {
  customInstructions: string;
  autoReply: boolean;
}

export interface LocationConfig {
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

export interface Location {
  id: string;
  googleAccountId: string;
  googleLocationId: string;
  name: string;
  address: string;
  photoUrl?: string;
  connected: boolean;
  connectedAt: Timestamp;
  config: LocationConfig;
  emailOnNewReview: boolean;
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

export { DEFAULT_LOCATION_PROMPT_TEMPLATE } from "@/lib/ai/prompt-templates";

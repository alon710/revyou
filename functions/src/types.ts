import { Timestamp } from "firebase-admin/firestore";

export type ReplyStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "posted"
  | "failed";

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
  wasEdited: boolean;
  editedReply?: string | null;
  postedReply?: string | null;
  postedAt?: Timestamp | null;
  postedBy?: string | null;
}

export interface StarConfig {
  customInstructions: string;
  autoReply: boolean;
}

export interface LocationConfig {
  locationName?: string;
  locationDescription: string;
  locationPhone?: string;
  toneOfVoice: "friendly" | "formal" | "humorous" | "professional";
  useEmojis: boolean;
  languageMode: "hebrew" | "english" | "auto-detect";
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

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Timestamp;
  stripeCustomerId?: string;
  googleRefreshToken?: string;
  selectedLocationId?: string;
}

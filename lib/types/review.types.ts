import { Timestamp } from "firebase/firestore";

export type ReplyStatus = "pending" | "rejected" | "posted" | "failed";

export interface ReviewCreate {
  userId: string; // Parent reference
  accountId: string; // Parent reference
  businessId: string; // Parent reference
  googleReviewId: string;
  googleReviewName?: string; // Full Google resource path
  name: string;
  photoUrl?: string;
  rating: number;
  text?: string;
  date: Timestamp;
  isAnonymous?: boolean;
  replyStatus?: ReplyStatus; // Default will be 'pending'
}

export interface Review extends Omit<ReviewCreate, "replyStatus"> {
  id: string;
  receivedAt: Timestamp;
  updateTime?: Timestamp;
  replyStatus: ReplyStatus; // Required in Review, optional in ReviewCreate
  aiReply?: string;
  aiReplyGeneratedAt?: Timestamp;
  postedReply?: string | null;
  postedAt?: Timestamp | null;
  postedBy?: string | null;
}

export interface ReviewUpdate {
  aiReply?: string;
  aiReplyGeneratedAt?: Timestamp;
  replyStatus?: ReplyStatus;
  postedReply?: string | null;
  postedAt?: Timestamp | null;
  postedBy?: string | null;
  updateTime?: Timestamp;
}

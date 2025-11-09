import { Timestamp, WithFieldValue, PartialWithFieldValue } from "firebase/firestore";

export type ReplyStatus = "pending" | "rejected" | "posted" | "failed" | "quota_exceeded";

export interface ReviewCreate {
  userId: string;
  accountId: string;
  businessId: string;
  googleReviewId: string;
  googleReviewName?: string;
  name: string;
  photoUrl?: string;
  rating: number;
  text?: string;
  date: Timestamp;
  isAnonymous?: boolean;
  replyStatus?: ReplyStatus;
}

export interface Review extends Omit<ReviewCreate, "replyStatus"> {
  id: string;
  receivedAt: Timestamp;
  updateTime?: Timestamp;
  replyStatus: ReplyStatus;
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

// Write-time types that accept FieldValue sentinels for timestamp fields
export type ReviewCreateInput = WithFieldValue<ReviewCreate>;
export type ReviewUpdateInput = PartialWithFieldValue<ReviewUpdate>;

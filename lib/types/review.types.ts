import type { Review as DrizzleReview, ReviewInsert } from "@/lib/db/schema";

export type ReplyStatus = "pending" | "rejected" | "posted" | "failed" | "quota_exceeded";

export type Review = DrizzleReview;

export type ReviewCreate = Omit<ReviewInsert, "id" | "receivedAt" | "updateTime">;

export type ReviewUpdate = Partial<Pick<ReviewInsert, "replyStatus" | "updateTime">>;

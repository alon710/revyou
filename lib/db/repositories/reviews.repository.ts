import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reviews, userAccounts, type Review, type ReviewInsert } from "@/lib/db/schema";
import type { ReviewFilters, ReplyStatus } from "@/lib/types";
import { BaseRepository } from "./base.repository";

export class ReviewsRepository extends BaseRepository<ReviewInsert, Review, Partial<Review>> {
  constructor(
    private userId: string,
    private accountId: string,
    private businessId: string
  ) {
    super();
  }

  async get(reviewId: string): Promise<Review | null> {
    const result = await db
      .select({ reviews })
      .from(reviews)
      .innerJoin(userAccounts, eq(reviews.accountId, userAccounts.accountId))
      .where(
        and(
          eq(reviews.id, reviewId),
          eq(reviews.accountId, this.accountId),
          eq(reviews.businessId, this.businessId),
          eq(userAccounts.userId, this.userId)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0].reviews : null;
  }

  async list(filters: ReviewFilters = {}): Promise<Review[]> {
    let query = db
      .select({ reviews })
      .from(reviews)
      .innerJoin(userAccounts, eq(reviews.accountId, userAccounts.accountId))
      .where(
        and(
          eq(reviews.accountId, this.accountId),
          eq(reviews.businessId, this.businessId),
          eq(userAccounts.userId, this.userId)
        )
      );

    const results = await query;
    let reviewList = results.map((r) => r.reviews);

    if (filters.replyStatus && filters.replyStatus.length > 0) {
      reviewList = reviewList.filter((r) => filters.replyStatus!.includes(r.replyStatus as ReplyStatus));
    }

    if (filters.rating && filters.rating.length > 0) {
      reviewList = reviewList.filter((r) => filters.rating!.includes(r.rating));
    }

    if (filters.ids && filters.ids.length > 0) {
      const idSet = new Set(filters.ids);
      reviewList = reviewList.filter((r) => idSet.has(r.id));
    }

    return reviewList;
  }

  async create(data: ReviewInsert): Promise<Review> {
    const reviewData: ReviewInsert = {
      ...data,
      replyStatus: data.replyStatus || "pending",
    };

    const [created] = await db.insert(reviews).values(reviewData).returning();

    if (!created) throw new Error("Failed to create review");

    return created;
  }

  async update(reviewId: string, data: Partial<Review>): Promise<Review> {
    const [updated] = await db
      .update(reviews)
      .set({ ...data, updateTime: new Date() })
      .where(eq(reviews.id, reviewId))
      .returning();

    if (!updated) {
      throw new Error("Review not found");
    }

    return updated;
  }

  async delete(reviewId: string): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, reviewId));
  }

  async updateAiReply(reviewId: string, aiReply: string): Promise<Review> {
    return this.update(reviewId, {
      aiReply,
      aiReplyGeneratedAt: new Date(),
    });
  }

  async markAsPosted(reviewId: string, postedReply: string, postedBy: string): Promise<Review> {
    return this.update(reviewId, {
      replyStatus: "posted",
      postedReply,
      postedAt: new Date(),
      postedBy,
    });
  }

  async markAsRejected(reviewId: string): Promise<Review> {
    return this.update(reviewId, {
      replyStatus: "rejected",
    });
  }

  async findByGoogleReviewId(googleReviewId: string): Promise<Review | null> {
    const result = await db
      .select()
      .from(reviews)
      .innerJoin(userAccounts, eq(reviews.accountId, userAccounts.accountId))
      .where(
        and(
          eq(reviews.googleReviewId, googleReviewId),
          eq(reviews.accountId, this.accountId),
          eq(reviews.businessId, this.businessId),
          eq(userAccounts.userId, this.userId)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0].reviews : null;
  }
}

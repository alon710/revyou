import { eq, and, inArray, gte, lte, exists, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reviews, reviewResponses, userAccounts, type Review, type ReviewInsert } from "@/lib/db/schema";
import type { ReviewFilters } from "@/lib/types";
import { BaseRepository } from "./base.repository";
import { NotFoundError, ForbiddenError } from "@/lib/api/errors";

export type ReviewWithLatestGeneration = Review & {
  latestAiReply?: string;
  latestAiReplyId?: string;
};

export class ReviewsRepository extends BaseRepository<ReviewInsert, Review, Partial<Review>> {
  constructor(
    private userId: string,
    private accountId: string,
    private businessId: string
  ) {
    super();
  }

  private async verifyAccess(): Promise<boolean> {
    const access = await db.query.userAccounts.findFirst({
      where: and(eq(userAccounts.userId, this.userId), eq(userAccounts.accountId, this.accountId)),
    });
    return !!access;
  }

  private getAccessCondition() {
    return exists(
      db
        .select()
        .from(userAccounts)
        .where(and(eq(userAccounts.userId, this.userId), eq(userAccounts.accountId, this.accountId)))
    );
  }

  async get(reviewId: string): Promise<ReviewWithLatestGeneration | null> {
    const review = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.id, reviewId),
        eq(reviews.accountId, this.accountId),
        eq(reviews.businessId, this.businessId),
        this.getAccessCondition()
      ),
    });

    if (!review) return null;

    const latestGen = await db.query.reviewResponses.findFirst({
      where: and(eq(reviewResponses.reviewId, reviewId), eq(reviewResponses.status, "generated")),
      orderBy: [desc(reviewResponses.createdAt)],
    });

    return {
      ...review,
      latestAiReply: latestGen?.text,
      latestAiReplyId: latestGen?.id,
    };
  }

  async list(filters: ReviewFilters = {}): Promise<ReviewWithLatestGeneration[]> {
    const conditions = [
      eq(reviews.accountId, this.accountId),
      eq(reviews.businessId, this.businessId),
      this.getAccessCondition(),
    ];

    if (filters.replyStatus && filters.replyStatus.length > 0) {
      conditions.push(inArray(reviews.replyStatus, filters.replyStatus));
    }

    if (filters.rating && filters.rating.length > 0) {
      conditions.push(inArray(reviews.rating, filters.rating));
    }

    if (filters.ids && filters.ids.length > 0) {
      conditions.push(inArray(reviews.id, filters.ids));
    }

    if (filters.dateFrom) {
      conditions.push(gte(reviews.receivedAt, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(reviews.receivedAt, filters.dateTo));
    }

    const reviewsData = await db.query.reviews.findMany({
      where: and(...conditions),
    });

    const reviewsWithGen = await Promise.all(
      reviewsData.map(async (review) => {
        const latestGen = await db.query.reviewResponses.findFirst({
          where: and(eq(reviewResponses.reviewId, review.id), eq(reviewResponses.status, "generated")),
          orderBy: [desc(reviewResponses.createdAt)],
        });
        return {
          ...review,
          latestAiReply: latestGen?.text,
          latestAiReplyId: latestGen?.id,
        };
      })
    );

    return reviewsWithGen;
  }

  async create(data: ReviewInsert): Promise<Review> {
    if (!(await this.verifyAccess())) {
      throw new ForbiddenError("Access denied");
    }

    const reviewData: ReviewInsert = {
      ...data,
      accountId: this.accountId,
      businessId: this.businessId,
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
      .where(
        and(
          eq(reviews.id, reviewId),
          eq(reviews.accountId, this.accountId),
          eq(reviews.businessId, this.businessId),
          this.getAccessCondition()
        )
      )
      .returning();

    if (!updated) {
      throw new NotFoundError("Review not found or access denied");
    }

    return updated;
  }

  async delete(reviewId: string): Promise<void> {
    const [deleted] = await db
      .delete(reviews)
      .where(
        and(
          eq(reviews.id, reviewId),
          eq(reviews.accountId, this.accountId),
          eq(reviews.businessId, this.businessId),
          this.getAccessCondition()
        )
      )
      .returning();

    if (!deleted) {
      throw new NotFoundError("Review not found or access denied");
    }
  }

  async markAsPosted(reviewId: string, postedReply: string, postedBy: string | null): Promise<Review> {
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
    const result = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.googleReviewId, googleReviewId),
        eq(reviews.accountId, this.accountId),
        eq(reviews.businessId, this.businessId),
        this.getAccessCondition()
      ),
    });

    return result ?? null;
  }
}

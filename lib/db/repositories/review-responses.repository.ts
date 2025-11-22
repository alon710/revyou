import { eq, and, desc, exists } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  reviewResponses,
  userAccounts,
  type ReviewResponse,
  type ReviewResponseInsert,
  type Review,
} from "@/lib/db/schema";
import { ForbiddenError } from "@/lib/api/errors";

export type ReviewResponseWithReview = ReviewResponse & {
  review: Review;
};

export class ReviewResponsesRepository {
  constructor(
    private userId: string,
    private accountId: string,
    private businessId: string
  ) {}

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

  async create(data: Omit<ReviewResponseInsert, "accountId" | "businessId">): Promise<ReviewResponse> {
    if (!(await this.verifyAccess())) {
      throw new ForbiddenError("Access denied");
    }

    const insertData: ReviewResponseInsert = {
      ...data,
      accountId: this.accountId,
      businessId: this.businessId,
    };

    const [created] = await db.insert(reviewResponses).values(insertData).returning();

    if (!created) throw new Error("Failed to create review response entry");

    return created;
  }

  async updateStatus(id: string, status: "approved" | "rejected"): Promise<ReviewResponse | undefined> {
    if (!(await this.verifyAccess())) {
      throw new ForbiddenError("Access denied");
    }

    const [updated] = await db
      .update(reviewResponses)
      .set({ status })
      .where(
        and(
          eq(reviewResponses.id, id),
          eq(reviewResponses.accountId, this.accountId),
          eq(reviewResponses.businessId, this.businessId)
        )
      )
      .returning();

    return updated;
  }

  async getLatestGenerated(reviewId: string): Promise<ReviewResponse | undefined> {
    return await db.query.reviewResponses.findFirst({
      where: and(
        eq(reviewResponses.reviewId, reviewId),
        eq(reviewResponses.accountId, this.accountId),
        eq(reviewResponses.businessId, this.businessId),
        eq(reviewResponses.status, "generated"),
        this.getAccessCondition()
      ),
      orderBy: [desc(reviewResponses.createdAt)],
    });
  }

  async getRecent(status: "approved" | "rejected", limit: number = 5): Promise<ReviewResponseWithReview[]> {
    return await db.query.reviewResponses.findMany({
      where: and(
        eq(reviewResponses.accountId, this.accountId),
        eq(reviewResponses.businessId, this.businessId),
        eq(reviewResponses.status, status),
        this.getAccessCondition()
      ),
      orderBy: [desc(reviewResponses.createdAt)],
      limit: limit,
      with: {
        review: true,
      },
    });
  }
}

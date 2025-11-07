import type {
  ReviewCreate,
  Review,
  ReviewUpdate,
  ReviewFilters,
} from "@/lib/types";
import { ReviewsRepositoryAdmin } from "@/lib/repositories/reviews.repository.admin";
import { BaseController } from "./base.controller";

export class ReviewsController extends BaseController<
  ReviewCreate,
  Review,
  ReviewUpdate
> {
  private userId: string;
  private accountId: string;
  private businessId: string;

  constructor(userId: string, accountId: string, businessId: string) {
    const repository = new ReviewsRepositoryAdmin(
      userId,
      accountId,
      businessId
    );
    super(repository);
    this.userId = userId;
    this.accountId = accountId;
    this.businessId = businessId;
  }

  async getReviews(filters: ReviewFilters = {}): Promise<Review[]> {
    return this.handleError(
      () => this.repository.list(filters),
      "Failed to fetch reviews"
    );
  }

  async getReview(reviewId: string): Promise<Review> {
    return this.ensureExists(reviewId, "Review");
  }

  async updateReview(reviewId: string, data: ReviewUpdate): Promise<Review> {
    return this.handleError(async () => {
      await this.ensureExists(reviewId, "Review");
      return this.repository.update(reviewId, data);
    }, "Failed to update review");
  }

  async updateAiReply(reviewId: string, aiReply: string): Promise<Review> {
    const repo = this.repository as ReviewsRepositoryAdmin;
    return this.handleError(
      () => repo.updateAiReply(reviewId, aiReply),
      "Failed to update AI reply"
    );
  }

  async markAsPosted(
    reviewId: string,
    postedReply: string,
    postedBy: string
  ): Promise<Review> {
    const repo = this.repository as ReviewsRepositoryAdmin;
    return this.handleError(
      () => repo.markAsPosted(reviewId, postedReply, postedBy),
      "Failed to mark review as posted"
    );
  }

  async markAsRejected(reviewId: string): Promise<Review> {
    const repo = this.repository as ReviewsRepositoryAdmin;
    return this.handleError(
      () => repo.markAsRejected(reviewId),
      "Failed to mark review as rejected"
    );
  }

  async findByGoogleReviewId(googleReviewId: string): Promise<Review | null> {
    const repo = this.repository as ReviewsRepositoryAdmin;
    return repo.findByGoogleReviewId(googleReviewId);
  }

  async createReview(data: ReviewCreate): Promise<Review> {
    return this.handleError(
      () => this.repository.create(data),
      "Failed to create review"
    );
  }
}

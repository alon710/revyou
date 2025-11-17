import type { ReviewFilters, Review, ReviewCreate } from "@/lib/types";
import { ReviewsRepository } from "@/lib/db/repositories";

export class ReviewsController {
  private repository: ReviewsRepository;

  constructor(userId: string, accountId: string, businessId: string) {
    this.repository = new ReviewsRepository(userId, accountId, businessId);
  }

  async getReviews(filters: ReviewFilters = {}): Promise<Review[]> {
    return this.repository.list(filters);
  }

  async getReview(reviewId: string): Promise<Review> {
    const review = await this.repository.get(reviewId);
    if (!review) throw new Error("Review not found");
    return review;
  }

  async updateReview(reviewId: string, data: Partial<Review>): Promise<Review> {
    await this.getReview(reviewId);
    return this.repository.update(reviewId, data);
  }

  async updateAiReply(reviewId: string, aiReply: string): Promise<Review> {
    return this.repository.updateAiReply(reviewId, aiReply);
  }

  async markAsPosted(reviewId: string, postedReply: string, postedBy: string): Promise<Review> {
    return this.repository.markAsPosted(reviewId, postedReply, postedBy);
  }

  async markAsRejected(reviewId: string): Promise<Review> {
    return this.repository.markAsRejected(reviewId);
  }

  async findByGoogleReviewId(googleReviewId: string): Promise<Review | null> {
    return this.repository.findByGoogleReviewId(googleReviewId);
  }

  async createReview(data: ReviewCreate): Promise<Review> {
    return this.repository.create(data);
  }
}

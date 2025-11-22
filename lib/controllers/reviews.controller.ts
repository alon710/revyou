import type { ReviewFilters, Review, ReviewCreate } from "@/lib/types";
import {
  ReviewsRepository,
  ReviewResponsesRepository,
  AccountsRepository,
  BusinessesRepository,
  type ReviewWithLatestGeneration,
} from "@/lib/db/repositories";
import { generateAIReply } from "@/lib/ai/gemini";
import { buildReplyPrompt, type PromptSample } from "@/lib/ai/prompts/builder";
import { postReplyToGoogle } from "@/lib/google/reviews";
import { decryptToken } from "@/lib/google/business-profile";

export class ReviewsController {
  private repository: ReviewsRepository;
  private responsesRepo: ReviewResponsesRepository;
  private accountsRepo: AccountsRepository;
  private businessesRepo: BusinessesRepository;

  constructor(userId: string, accountId: string, businessId: string) {
    this.repository = new ReviewsRepository(userId, accountId, businessId);
    this.responsesRepo = new ReviewResponsesRepository(userId, accountId, businessId);
    this.accountsRepo = new AccountsRepository(userId);
    this.businessesRepo = new BusinessesRepository(userId, accountId);
  }

  async getReviews(filters: ReviewFilters = {}): Promise<ReviewWithLatestGeneration[]> {
    return this.repository.list(filters);
  }

  async getReview(reviewId: string): Promise<ReviewWithLatestGeneration> {
    const review = await this.repository.get(reviewId);
    if (!review) throw new Error("Review not found");
    return review;
  }

  async updateReview(reviewId: string, data: Partial<Review>): Promise<Review> {
    await this.getReview(reviewId);
    return this.repository.update(reviewId, data);
  }

  async markAsPosted(reviewId: string, postedReply: string, postedBy: string | null): Promise<Review> {
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

  async generateReply(reviewId: string): Promise<{ review: ReviewWithLatestGeneration; aiReply: string }> {
    const review = await this.getReview(reviewId);
    const business = await this.businessesRepo.get(review.businessId);
    if (!business) throw new Error("Business not found");

    const approvedGenerations = await this.responsesRepo.getRecent("approved", 5);
    const rejectedGenerations = await this.responsesRepo.getRecent("rejected", 5);

    const approvedSamples: PromptSample[] = approvedGenerations.map((g) => ({
      review: g.review,
      reply: g.text,
    }));

    const rejectedSamples: PromptSample[] = rejectedGenerations.map((g) => ({
      review: g.review,
      reply: g.text,
    }));

    const latestGen = await this.responsesRepo.getLatestGenerated(reviewId);
    if (latestGen) {
      await this.responsesRepo.updateStatus(latestGen.id, "rejected");
    }

    const prompt = buildReplyPrompt(business, review, approvedSamples, rejectedSamples);
    const aiReply = await generateAIReply(prompt);

    await this.responsesRepo.create({
      reviewId,
      text: aiReply,
      status: "generated",
    });

    const updatedReview = await this.getReview(reviewId);

    return {
      review: updatedReview,
      aiReply,
    };
  }

  async postReply(
    reviewId: string,
    customReply?: string,
    userId?: string
  ): Promise<{ review: Review; replyPosted: string }> {
    const review = await this.getReview(reviewId);
    const latestGen = await this.responsesRepo.getLatestGenerated(reviewId);

    const replyToPost = customReply || latestGen?.text;

    if (!replyToPost) {
      throw new Error("No reply to post. Generate AI reply first or provide custom reply.");
    }

    const account = await this.accountsRepo.get(review.accountId);
    if (!account) throw new Error("Account not found");

    const refreshToken = await decryptToken(account.googleRefreshToken);

    await postReplyToGoogle(
      review.googleReviewName || review.googleReviewId,
      replyToPost,
      refreshToken,
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!
    );

    const updatedReview = await this.markAsPosted(reviewId, replyToPost, userId || null);

    if (latestGen && latestGen.text === replyToPost) {
      await this.responsesRepo.updateStatus(latestGen.id, "approved");
    } else {
      await this.responsesRepo.create({
        reviewId,
        text: replyToPost,
        status: "approved",
      });

      if (latestGen) {
        await this.responsesRepo.updateStatus(latestGen.id, "rejected");
      }
    }

    return { review: updatedReview, replyPosted: replyToPost };
  }
}

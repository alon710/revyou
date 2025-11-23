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
  private userId: string;

  constructor(userId: string, accountId: string, businessId: string) {
    this.userId = userId;
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

  async markAsPosted(reviewId: string): Promise<Review> {
    return this.repository.markAsPosted(reviewId);
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

    const approvedGenerations = await this.responsesRepo.getRecent("posted", 5);

    const approvedSamples: PromptSample[] = approvedGenerations.map((g) => ({
      review: g.review,
      reply: g.text,
    }));

    const rejectedGenerations = await this.responsesRepo.getRecent("rejected", 5);
    const rejectedSamples: PromptSample[] = rejectedGenerations.map((g) => ({
      review: g.review,
      reply: g.text,
    }));

    const latestGen = await this.responsesRepo.getLatestDraft(reviewId);
    if (latestGen) {
      await this.responsesRepo.updateStatus(latestGen.id, "rejected");
    }

    const prompt = buildReplyPrompt(business, review, approvedSamples, rejectedSamples);
    const aiReply = await generateAIReply(prompt);

    await this.responsesRepo.create({
      reviewId,
      text: aiReply,
      status: "draft",
      generatedBy: null,
    });

    const updatedReview = await this.getReview(reviewId);

    return {
      review: updatedReview,
      aiReply,
    };
  }

  async saveDraft(
    reviewId: string,
    customReply: string
  ): Promise<{ review: ReviewWithLatestGeneration; savedDraft: string }> {
    const review = await this.getReview(reviewId);
    const latestDraft = await this.responsesRepo.getLatestDraft(reviewId);

    if (latestDraft && latestDraft.text === customReply && latestDraft.status === "draft") {
      if (latestDraft.generatedBy) {
        return { review, savedDraft: customReply };
      }
    }

    await this.responsesRepo.create({
      reviewId,
      text: customReply,
      status: "draft",
      generatedBy: this.userId,
    });

    if (latestDraft) {
      await this.responsesRepo.updateStatus(latestDraft.id, "rejected");
    }

    const updatedReview = await this.getReview(reviewId);
    return { review: updatedReview, savedDraft: customReply };
  }

  async postReply(
    reviewId: string,
    customReply?: string,
    userId?: string
  ): Promise<{ review: Review; replyPosted: string }> {
    const review = await this.getReview(reviewId);
    const latestDraft = await this.responsesRepo.getLatestDraft(reviewId);

    const replyToPost = customReply || latestDraft?.text;

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

    const updatedReview = await this.markAsPosted(reviewId);

    const generatedBy =
      customReply && customReply !== latestDraft?.text ? (userId ?? null) : (latestDraft?.generatedBy ?? null);

    await this.responsesRepo.create({
      reviewId,
      text: replyToPost,
      status: "posted",
      generatedBy,
      postedBy: userId || null,
      postedAt: new Date(),
    });

    return { review: updatedReview, replyPosted: replyToPost };
  }
}

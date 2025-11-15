"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsController, BusinessesController, AccountsController } from "@/lib/controllers";
import type { Review, ReviewCreate, ReviewUpdate, ReviewFilters } from "@/lib/types";
import { generateAIReply } from "@/lib/ai/gemini";
import { buildReplyPrompt } from "@/lib/ai/prompts/builder";
import { postReplyToGoogle } from "@/lib/google/reviews";
import { decryptToken } from "@/lib/google/business-profile";

export async function getReviews(
  userId: string,
  accountId: string,
  businessId: string,
  filters: ReviewFilters = {}
): Promise<Review[]> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const controller = new ReviewsController(userId, accountId, businessId);
  return controller.getReviews(filters);
}

export async function getReview(
  userId: string,
  accountId: string,
  businessId: string,
  reviewId: string
): Promise<Review> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const controller = new ReviewsController(userId, accountId, businessId);
  return controller.getReview(reviewId);
}

export async function updateReview(
  userId: string,
  accountId: string,
  businessId: string,
  reviewId: string,
  data: ReviewUpdate
): Promise<Review> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot update another user's review");
  }

  const controller = new ReviewsController(userId, accountId, businessId);
  return controller.updateReview(reviewId, data);
}

export async function updateAiReply(
  userId: string,
  accountId: string,
  businessId: string,
  reviewId: string,
  aiReply: string
): Promise<Review> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot update another user's review");
  }

  const controller = new ReviewsController(userId, accountId, businessId);
  return controller.updateAiReply(reviewId, aiReply);
}

export async function rejectReview(
  userId: string,
  accountId: string,
  businessId: string,
  reviewId: string
): Promise<Review> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot update another user's review");
  }

  const controller = new ReviewsController(userId, accountId, businessId);
  return controller.markAsRejected(reviewId);
}

export async function generateReviewReply(
  userId: string,
  accountId: string,
  businessId: string,
  reviewId: string
): Promise<{ review: Review; aiReply: string }> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const reviewController = new ReviewsController(userId, accountId, businessId);
  const review = await reviewController.getReview(reviewId);

  const businessController = new BusinessesController(userId, accountId);
  const business = await businessController.getBusiness(businessId);

  const prompt = buildReplyPrompt(business.config, review, business.name, business.config.phoneNumber);
  const aiReply = await generateAIReply(prompt);

  const updatedReview = await reviewController.updateAiReply(reviewId, aiReply);

  return {
    review: updatedReview,
    aiReply,
  };
}

export async function postReviewReply(
  userId: string,
  accountId: string,
  businessId: string,
  reviewId: string,
  customReply?: string
): Promise<Review> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const reviewController = new ReviewsController(userId, accountId, businessId);
  const review = await reviewController.getReview(reviewId);

  const replyToPost = customReply || review.aiReply;
  if (!replyToPost) {
    throw new Error("No reply to post. Generate AI reply first or provide custom reply.");
  }

  const accountController = new AccountsController(userId);
  const account = await accountController.getAccount(accountId);

  try {
    const refreshToken = await decryptToken(account.googleRefreshToken);
    await postReplyToGoogle(review.googleReviewName || review.googleReviewId, replyToPost, refreshToken);

    return reviewController.markAsPosted(reviewId, replyToPost, userId);
  } catch (error) {
    await reviewController.updateReview(reviewId, { replyStatus: "failed" });
    throw error;
  }
}

export async function createReview(
  userId: string,
  accountId: string,
  businessId: string,
  data: Omit<ReviewCreate, "userId" | "accountId" | "businessId">
): Promise<Review> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot create review for another user");
  }

  const controller = new ReviewsController(userId, accountId, businessId);
  const reviewData: ReviewCreate = {
    userId,
    accountId,
    businessId,
    ...data,
  };

  return controller.createReview(reviewData);
}

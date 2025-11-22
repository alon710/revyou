"use server";

import { ReviewsController, BusinessesController, AccountsController } from "@/lib/controllers";
import type { ReviewCreate, ReviewUpdate } from "@/lib/types";
import { generateAIReply } from "@/lib/ai/gemini";
import { buildReplyPrompt } from "@/lib/ai/prompts/builder";
import { postReplyToGoogle } from "@/lib/google/reviews";
import { decryptToken } from "@/lib/google/business-profile";
import { createSafeAction } from "./safe-action";
import { z } from "zod";

const ReviewFiltersSchema = z
  .object({
    ids: z.array(z.string()).optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    sort: z
      .object({
        orderBy: z.string(),
        orderDirection: z.enum(["asc", "desc"]),
      })
      .optional(),
    replyStatus: z.array(z.enum(["pending", "rejected", "posted", "failed", "quota_exceeded"])).optional(),
    rating: z.array(z.number()).optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
  })
  .optional();

const ContextSchema = z.object({
  accountId: z.string().uuid(),
  businessId: z.string().uuid(),
});

const GetReviewsSchema = ContextSchema.extend({
  filters: ReviewFiltersSchema,
});

const ReviewIdSchema = ContextSchema.extend({
  reviewId: z.string().uuid(),
});

const UpdateReviewSchema = ReviewIdSchema.extend({
  data: z.custom<ReviewUpdate>(),
});

const UpdateAiReplySchema = ReviewIdSchema.extend({
  aiReply: z.string(),
});

const PostReviewReplySchema = ReviewIdSchema.extend({
  customReply: z.string().optional(),
});

const CreateReviewSchema = ContextSchema.extend({
  data: z.custom<Omit<ReviewCreate, "accountId" | "businessId">>(),
});

export const getReviews = createSafeAction(GetReviewsSchema, async ({ accountId, businessId, filters }, { userId }) => {
  const controller = new ReviewsController(userId, accountId, businessId);
  return controller.getReviews(filters);
});

export const getReview = createSafeAction(ReviewIdSchema, async ({ accountId, businessId, reviewId }, { userId }) => {
  const controller = new ReviewsController(userId, accountId, businessId);
  return controller.getReview(reviewId);
});

export const updateReview = createSafeAction(
  UpdateReviewSchema,
  async ({ accountId, businessId, reviewId, data }, { userId }) => {
    const controller = new ReviewsController(userId, accountId, businessId);
    return controller.updateReview(reviewId, data);
  }
);

export const updateAiReply = createSafeAction(
  UpdateAiReplySchema,
  async ({ accountId, businessId, reviewId, aiReply }, { userId }) => {
    const controller = new ReviewsController(userId, accountId, businessId);
    return controller.updateAiReply(reviewId, aiReply);
  }
);

export const rejectReview = createSafeAction(
  ReviewIdSchema,
  async ({ accountId, businessId, reviewId }, { userId }) => {
    const controller = new ReviewsController(userId, accountId, businessId);
    return controller.markAsRejected(reviewId);
  }
);

export const generateReviewReply = createSafeAction(
  ReviewIdSchema,
  async ({ accountId, businessId, reviewId }, { userId }) => {
    const reviewController = new ReviewsController(userId, accountId, businessId);
    const review = await reviewController.getReview(reviewId);

    const businessController = new BusinessesController(userId, accountId);
    const business = await businessController.getBusiness(businessId);

    const prompt = buildReplyPrompt(business, review);
    const aiReply = await generateAIReply(prompt);

    const updatedReview = await reviewController.updateAiReply(reviewId, aiReply);

    return {
      review: updatedReview,
      aiReply,
    };
  }
);

export const postReviewReply = createSafeAction(
  PostReviewReplySchema,
  async ({ accountId, businessId, reviewId, customReply }, { userId }) => {
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
);

export const createReview = createSafeAction(
  CreateReviewSchema,
  async ({ accountId, businessId, data }, { userId }) => {
    const controller = new ReviewsController(userId, accountId, businessId);
    const reviewData: ReviewCreate = {
      accountId,
      businessId,
      ...data,
    };
    return controller.createReview(reviewData);
  }
);

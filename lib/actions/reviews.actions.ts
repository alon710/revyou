"use server";

import { ReviewsController } from "@/lib/controllers/reviews.controller";
import type { ReviewCreate, ReviewUpdate } from "@/lib/types";
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
    const controller = new ReviewsController(userId, accountId, businessId);
    return controller.generateReply(reviewId);
  }
);

export const postReviewReply = createSafeAction(
  PostReviewReplySchema,
  async ({ accountId, businessId, reviewId, customReply }, { userId }) => {
    const controller = new ReviewsController(userId, accountId, businessId);
    const { review } = await controller.postReply(reviewId, customReply, userId);
    return review;
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

"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { AccountsController, BusinessesController } from "@/lib/controllers";
import { listAllBusinesses, decryptToken, subscribeToNotifications } from "@/lib/google/business-profile";
import { listReviews, starRatingToNumber, parseGoogleTimestamp } from "@/lib/google/reviews";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { BusinessesRepository } from "@/lib/db/repositories/businesses.repository";
import { ReviewsRepository, ReviewWithLatestGeneration } from "@/lib/db/repositories/reviews.repository";
import { ReviewResponsesRepository } from "@/lib/db/repositories/review-responses.repository";
import type { GoogleBusinessProfileBusiness } from "@/lib/types";
import type { ReviewInsert, ReviewResponseInsert } from "@/lib/db/schema";

export async function getGoogleBusinesses(userId: string, accountId: string): Promise<GoogleBusinessProfileBusiness[]> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const accountsController = new AccountsController(userId);
  const account = await accountsController.getAccount(accountId);

  if (!account.googleRefreshToken) {
    throw new Error("No Google refresh token found");
  }

  const refreshToken = await decryptToken(account.googleRefreshToken);
  return listAllBusinesses(refreshToken);
}

export async function subscribeToGoogleNotifications(
  userId: string,
  accountId: string
): Promise<{ success: boolean; alreadySubscribed?: boolean }> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const accountsController = new AccountsController(userId);
  const businessesController = new BusinessesController(userId, accountId);

  const account = await accountsController.getAccount(accountId);

  if (!account) {
    throw new Error("Account not found");
  }

  if (account.googleAccountName) {
    return { success: true, alreadySubscribed: true };
  }

  if (!account.googleRefreshToken) {
    throw new Error("Missing Google refresh token");
  }

  const businesses = await businessesController.getBusinesses();
  if (businesses.length === 0) {
    throw new Error("No businesses found");
  }

  const googleAccountName = businesses[0].googleBusinessId.split("/locations")[0];

  const projectId = process.env.NEXT_PUBLIC_GCP_PROJECT_ID || "review-ai-reply";
  const topicName = process.env.PUBSUB_TOPIC_NAME || "gmb-review-notifications";
  const pubsubTopic = `projects/${projectId}/topics/${topicName}`;

  const refreshToken = await decryptToken(account.googleRefreshToken);

  await subscribeToNotifications(googleAccountName, pubsubTopic, refreshToken);

  await accountsController.updateAccount(accountId, { googleAccountName });

  return { success: true };
}

export async function importRecentReviews(
  userId: string,
  accountId: string,
  businessId: string
): Promise<ReviewWithLatestGeneration[]> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const accountsRepo = new AccountsRepository(userId);
  const businessesRepo = new BusinessesRepository(userId, accountId);
  const reviewsRepo = new ReviewsRepository(userId, accountId, businessId);
  const reviewResponsesRepo = new ReviewResponsesRepository(userId, accountId, businessId);

  const account = await accountsRepo.get(accountId);
  if (!account || !account.googleRefreshToken) {
    throw new Error("Account not found or missing Google refresh token");
  }

  const business = await businessesRepo.get(businessId);
  if (!business || !business.googleBusinessId) {
    throw new Error("Business not found or missing Google Business ID");
  }

  const refreshToken = await decryptToken(account.googleRefreshToken);

  for await (const reviewsResponse of listReviews(
    business.googleBusinessId,
    refreshToken,
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    5
  )) {
    if (reviewsResponse.reviews && reviewsResponse.reviews.length > 0) {
      const processingPromises = reviewsResponse.reviews.map(async (googleReview) => {
        const existingReview = await reviewsRepo.findByGoogleReviewId(googleReview.reviewId);

        if (!existingReview) {
          const hasReply = !!googleReview.reviewReply;

          const reviewData: ReviewInsert = {
            accountId,
            businessId,
            googleReviewId: googleReview.reviewId,
            googleReviewName: googleReview.name,
            name: googleReview.reviewer.displayName,
            photoUrl: googleReview.reviewer.profilePhotoUrl || null,
            rating: starRatingToNumber(googleReview.starRating),
            text: googleReview.comment || "",
            date: parseGoogleTimestamp(googleReview.createTime),
            updateTime: parseGoogleTimestamp(googleReview.updateTime),
            receivedAt: new Date(),
            isAnonymous: googleReview.reviewer.isAnonymous || false,
            replyStatus: hasReply ? "posted" : "pending",
            consumesQuota: false,
          };

          try {
            const newReview = await reviewsRepo.create(reviewData);

            if (hasReply && googleReview.reviewReply && googleReview.reviewReply.comment) {
              const responseData: Omit<ReviewResponseInsert, "accountId" | "businessId"> = {
                reviewId: newReview.id,
                text: googleReview.reviewReply.comment,
                status: "posted",
                postedAt: parseGoogleTimestamp(googleReview.reviewReply.updateTime),
                createdAt: new Date(),
                generatedBy: null,
                type: "imported",
              };

              try {
                await reviewResponsesRepo.create(responseData);
              } catch (error) {
                console.error(`Failed to create ReviewResponse for review ${newReview.id}:`, error);
              }
            }

            if (!hasReply) {
              try {
                const processReviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/internal/process-review`;
                const response = await fetch(processReviewUrl, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Internal-Secret": process.env.INTERNAL_API_SECRET!,
                  },
                  body: JSON.stringify({
                    userId,
                    accountId,
                    businessId,
                    reviewId: newReview.id,
                  }),
                });

                if (response.ok) {
                  await response.json();
                }
              } catch (error) {
                console.error(`Failed to trigger AI reply for review ${newReview.id}:`, error);
              }
            }
          } catch (error) {
            if (
              error instanceof Error &&
              error.cause &&
              typeof error.cause === "object" &&
              "code" in error.cause &&
              (error.cause as { code: unknown }).code === "23505"
            ) {
              return;
            }
            throw error;
          }
        }
      });

      await Promise.all(processingPromises);
    }

    break;
  }

  return reviewsRepo.list({
    limit: 5,
    sort: { orderBy: "receivedAt", orderDirection: "desc" },
  });
}

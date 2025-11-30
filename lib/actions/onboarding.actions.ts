"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { ReviewResponsesRepository } from "@/lib/db/repositories/review-responses.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { BusinessesRepository } from "@/lib/db/repositories/businesses.repository";
import { listReviews, starRatingToNumber, parseGoogleTimestamp, GoogleReview } from "@/lib/google/reviews";
import { decryptToken } from "@/lib/google/business-profile";
import { ReviewInsert, ReviewResponseInsert } from "@/lib/db/schema";
import { isDuplicateKeyError } from "@/lib/db/error-handlers";

export async function triggerReviewImport(accountId: string, businessId: string) {
  const { userId } = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    console.log("Importing past reviews", {
      userId,
      accountId,
      businessId,
    });

    const accountsRepo = new AccountsRepository(userId);
    const businessesRepo = new BusinessesRepository(userId, accountId);
    const reviewsRepo = new ReviewsRepository(userId, businessId);
    const reviewResponsesRepo = new ReviewResponsesRepository(userId, accountId, businessId);

    const account = await accountsRepo.get(accountId);
    if (!account || !account.googleRefreshToken) {
      return { success: false, error: "Account not found or missing Google refresh token" };
    }

    const business = await businessesRepo.get(businessId);
    if (!business || !business.googleBusinessId) {
      return { success: false, error: "Business not found or missing Google Business ID" };
    }

    const refreshToken = await decryptToken(account.googleRefreshToken);

    let importedCount = 0;
    let totalFetchedCount = 0;
    const MAX_IMPORT_COUNT = 500;
    const BATCH_SIZE = 500;
    let reviewBuffer: GoogleReview[] = [];

    const processReviewBatch = async (reviews: GoogleReview[]) => {
      const processingPromises = reviews.map(async (googleReview) => {
        const existingReview = await reviewsRepo.findByGoogleReviewId(googleReview.reviewId);

        if (!existingReview) {
          const hasReply = !!googleReview.reviewReply;

          const reviewData: ReviewInsert = {
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
            importedCount++;

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

              await reviewResponsesRepo.create(responseData);
            }
          } catch (error) {
            if (isDuplicateKeyError(error)) {
              return;
            }
            throw error;
          }
        }
      });

      await Promise.all(processingPromises);
    };

    for await (const reviewsResponse of listReviews(
      business.googleBusinessId,
      refreshToken,
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )) {
      if (reviewsResponse.reviews && reviewsResponse.reviews.length > 0) {
        let newReviews = reviewsResponse.reviews;

        if (totalFetchedCount + newReviews.length > MAX_IMPORT_COUNT) {
          newReviews = newReviews.slice(0, MAX_IMPORT_COUNT - totalFetchedCount);
        }

        totalFetchedCount += newReviews.length;
        console.log(`Fetched ${newReviews.length} reviews from Google (total: ${totalFetchedCount})`);

        reviewBuffer.push(...newReviews);

        if (reviewBuffer.length >= BATCH_SIZE) {
          console.log(`Processing batch of ${reviewBuffer.length} reviews...`);
          await processReviewBatch(reviewBuffer);
          reviewBuffer = [];
        }

        if (totalFetchedCount >= MAX_IMPORT_COUNT) {
          console.log(`Reached max import count of ${MAX_IMPORT_COUNT}, stopping import`);
          break;
        }
      }
    }

    if (reviewBuffer.length > 0) {
      console.log(`Processing final batch of ${reviewBuffer.length} reviews...`);
      await processReviewBatch(reviewBuffer);
    }

    console.log(`Imported ${importedCount} new reviews`);

    return { success: true, importedCount };
  } catch (error) {
    console.error("Error in triggerReviewImport action:", error);
    return { success: false, error: "Failed to trigger import" };
  }
}

import * as admin from "firebase-admin";
import { onMessagePublished } from "firebase-functions/v2/pubsub";
import { defineSecret } from "firebase-functions/params";
import { getReview, starRatingToNumber, parseGoogleTimestamp } from "../shared/google/reviews";
import { decryptToken } from "../shared/google/business-profile";
import type { Review, Business } from "../shared/types";
import { AccountsRepositoryAdmin } from "../shared/repositories/accounts.repository.admin";
import { ReviewsRepositoryAdmin } from "../shared/repositories/reviews.repository.admin";

const db = admin.firestore();
const tokenEncryptionSecret = defineSecret("TOKEN_ENCRYPTION_SECRET");
const googleClientId = defineSecret("GOOGLE_CLIENT_ID");
const googleClientSecret = defineSecret("GOOGLE_CLIENT_SECRET");

interface PubSubNotificationData {
  type: "NEW_REVIEW" | "UPDATED_REVIEW";
  review: string;
  location: string;
}

async function findBusinessByLocationId(locationName: string): Promise<{
  userId: string;
  accountId: string;
  business: Business;
} | null> {
  try {
    console.log("Searching for business with location:", locationName);

    const businessesSnapshot = await db
      .collectionGroup("businesses")
      .where("googleBusinessId", "==", locationName)
      .limit(1)
      .get();

    if (businessesSnapshot.empty) {
      console.error("No business found for location:", locationName);
      return null;
    }

    const businessDoc = businessesSnapshot.docs[0];

    const accountId = businessDoc.ref.parent.parent?.id;
    const userId = businessDoc.ref.parent.parent?.parent?.parent?.id;

    if (!userId || !accountId) {
      console.error("Failed to extract userId or accountId from document path");
      return null;
    }

    return {
      userId,
      accountId,
      business: { id: businessDoc.id, ...businessDoc.data() } as Business,
    };
  } catch (error) {
    console.error("Error finding business:", error);
    return null;
  }
}

async function getAccountRefreshToken(userId: string, accountId: string): Promise<string | null> {
  try {
    const accountsRepo = new AccountsRepositoryAdmin(userId);
    const account = await accountsRepo.get(accountId);

    if (!account) {
      console.error("Account not found", { userId, accountId });
      return null;
    }

    return account.googleRefreshToken || null;
  } catch (error) {
    console.error("Error fetching account refresh token:", error);
    return null;
  }
}

export const onGoogleReviewNotification = onMessagePublished(
  {
    topic: "gmb-review-notifications",
    secrets: [tokenEncryptionSecret, googleClientId, googleClientSecret],
    timeoutSeconds: 300,
    minInstances: 0,
    maxInstances: 5,
  },
  async (event) => {
    try {
      console.log("Received Pub/Sub notification:", event.data);

      const messageData = event.data.message.data;
      const notificationJson = Buffer.from(messageData, "base64").toString("utf-8");
      const notification: PubSubNotificationData = JSON.parse(notificationJson);

      console.log("Parsed notification:", notification);

      const { type: notificationType, review: reviewName, location: locationName } = notification;

      if (notificationType !== "NEW_REVIEW" && notificationType !== "UPDATED_REVIEW") {
        console.log("Ignoring non-review notification:", notificationType);
        return;
      }

      const businessData = await findBusinessByLocationId(locationName);
      if (!businessData) {
        console.error("Business not found for location:", locationName);
        return;
      }

      const { userId, accountId, business } = businessData;
      console.log("Found business:", {
        userId,
        accountId,
        businessId: business.id,
      });

      if (!business.connected) {
        console.log("Business not connected, skipping notification:", business.id);
        return;
      }

      const encryptedToken = await getAccountRefreshToken(userId, accountId);
      if (!encryptedToken) {
        console.error("No refresh token found for account:", accountId);
        return;
      }

      const refreshToken = await decryptToken(encryptedToken, tokenEncryptionSecret.value());

      console.log("Fetching review from GMB API:", reviewName);
      const googleReview = await getReview(
        reviewName,
        refreshToken,
        googleClientId.value(),
        googleClientSecret.value()
      );
      console.log("Fetched Google review:", googleReview);

      const reviewData: Omit<Review, "id"> = {
        userId,
        accountId,
        businessId: business.id,
        googleReviewId: googleReview.reviewId,
        googleReviewName: googleReview.name,
        name: googleReview.reviewer.displayName,
        photoUrl: googleReview.reviewer.profilePhotoUrl,
        rating: starRatingToNumber(googleReview.starRating),
        text: googleReview.comment,
        date: admin.firestore.Timestamp.fromDate(parseGoogleTimestamp(googleReview.createTime)),
        updateTime: admin.firestore.Timestamp.fromDate(parseGoogleTimestamp(googleReview.updateTime)),
        receivedAt: admin.firestore.Timestamp.now(),
        isAnonymous: googleReview.reviewer.isAnonymous ?? false,
        replyStatus: "pending",
        postedReply: null,
        postedAt: null,
        postedBy: null,
      };

      const reviewsRepo = new ReviewsRepositoryAdmin(userId, accountId, business.id);

      const existingReview = await reviewsRepo.findByGoogleReviewId(googleReview.reviewId);

      if (existingReview) {
        console.log("Review already exists, skipping:", existingReview.id);
        return;
      }

      console.log("Creating new review");
      const newReview = await reviewsRepo.create(reviewData);
      console.log("Review created successfully:", newReview.id);
    } catch (error) {
      console.error("Error processing Google review notification:", error);
      throw error;
    }
  }
);

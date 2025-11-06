import * as admin from "firebase-admin";
import { onMessagePublished } from "firebase-functions/v2/pubsub";
import {
  getReview,
  starRatingToNumber,
  parseGoogleTimestamp,
} from "../shared/google/reviews";
import { decryptToken } from "../shared/google/business-profile";
import type { Review, Business } from "../shared/types/database";

const db = admin.firestore();

interface PubSubNotificationData {
  notificationType: "NEW_REVIEW" | "UPDATED_REVIEW";
  reviewName: string; // Format: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
  locationName: string; // Format: accounts/{accountId}/locations/{locationId}
}

/**
 * Extracts location ID from Google resource name
 * @param locationName - Format: accounts/{accountId}/locations/{locationId}
 */
function extractLocationId(locationName: string): string {
  const parts = locationName.split("/");
  const locationIndex = parts.indexOf("locations");
  if (locationIndex === -1 || locationIndex + 1 >= parts.length) {
    throw new Error(`Invalid location name format: ${locationName}`);
  }
  return parts[locationIndex + 1];
}

/**
 * Finds the business in Firestore that matches the Google Business location
 */
async function findBusinessByLocationId(locationName: string): Promise<{
  userId: string;
  accountId: string;
  business: Business;
} | null> {
  try {
    const locationId = extractLocationId(locationName);
    console.log("Searching for business with locationId:", locationId);

    // Query all businesses with matching googleBusinessId
    const usersSnapshot = await db.collection("users").get();

    for (const userDoc of usersSnapshot.docs) {
      const accountsSnapshot = await userDoc.ref.collection("accounts").get();

      for (const accountDoc of accountsSnapshot.docs) {
        const businessesSnapshot = await accountDoc.ref
          .collection("businesses")
          .where("googleBusinessId", "==", locationName)
          .get();

        if (!businessesSnapshot.empty) {
          const businessDoc = businessesSnapshot.docs[0];
          return {
            userId: userDoc.id,
            accountId: accountDoc.id,
            business: businessDoc.data() as Business,
          };
        }
      }
    }

    console.error("No business found for location:", locationName);
    return null;
  } catch (error) {
    console.error("Error finding business:", error);
    return null;
  }
}

/**
 * Gets the encrypted refresh token for an account
 */
async function getAccountRefreshToken(
  userId: string,
  accountId: string
): Promise<string | null> {
  try {
    const accountDoc = await db
      .collection("users")
      .doc(userId)
      .collection("accounts")
      .doc(accountId)
      .get();

    if (!accountDoc.exists) {
      console.error("Account not found", { userId, accountId });
      return null;
    }

    const accountData = accountDoc.data();
    return accountData?.googleRefreshToken || null;
  } catch (error) {
    console.error("Error fetching account refresh token:", error);
    return null;
  }
}

/**
 * Cloud Function triggered by Pub/Sub messages from Google My Business
 */
export const onGoogleReviewNotification = onMessagePublished(
  {
    topic: "gmb-review-notifications",
    timeoutSeconds: 300,
    minInstances: 0,
    maxInstances: 5,
  },
  async (event) => {
    try {
      console.log("Received Pub/Sub notification:", event.data);

      // Parse the notification data
      const messageData = event.data.message.data;
      const notificationJson = Buffer.from(messageData, "base64").toString(
        "utf-8"
      );
      const notification: PubSubNotificationData = JSON.parse(notificationJson);

      console.log("Parsed notification:", notification);

      const { notificationType, reviewName, locationName } = notification;

      // Only process review notifications
      if (
        notificationType !== "NEW_REVIEW" &&
        notificationType !== "UPDATED_REVIEW"
      ) {
        console.log("Ignoring non-review notification:", notificationType);
        return;
      }

      // Find the business in our database
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

      // Only process notifications for connected businesses
      if (!business.connected) {
        console.log(
          "Business not connected, skipping notification:",
          business.id
        );
        return;
      }

      // Get the account's refresh token
      const encryptedToken = await getAccountRefreshToken(userId, accountId);
      if (!encryptedToken) {
        console.error("No refresh token found for account:", accountId);
        return;
      }

      // Decrypt the refresh token
      const refreshToken = await decryptToken(encryptedToken);

      // Fetch the full review data from Google My Business API
      console.log("Fetching review from GMB API:", reviewName);
      const googleReview = await getReview(reviewName, refreshToken);
      console.log("Fetched Google review:", googleReview);

      // Map Google review to our database structure
      const reviewData: Omit<Review, "id"> = {
        googleReviewId: googleReview.reviewId,
        name: googleReview.reviewer.displayName,
        photoUrl: googleReview.reviewer.profilePhotoUrl,
        rating: starRatingToNumber(googleReview.starRating),
        text: googleReview.comment,
        date: admin.firestore.Timestamp.fromDate(
          parseGoogleTimestamp(googleReview.createTime)
        ),
        updateTime: admin.firestore.Timestamp.fromDate(
          parseGoogleTimestamp(googleReview.updateTime)
        ),
        receivedAt: admin.firestore.Timestamp.now(),
        isAnonymous: googleReview.reviewer.isAnonymous,
        replyStatus: "pending",
        postedReply: null,
        postedAt: null,
        postedBy: null,
      };

      // Check if review already exists
      const reviewsRef = db
        .collection("users")
        .doc(userId)
        .collection("accounts")
        .doc(accountId)
        .collection("businesses")
        .doc(business.id)
        .collection("reviews");

      const existingReviewSnapshot = await reviewsRef
        .where("googleReviewId", "==", googleReview.reviewId)
        .limit(1)
        .get();

      if (!existingReviewSnapshot.empty) {
        // Update existing review
        const existingReviewDoc = existingReviewSnapshot.docs[0];
        console.log("Updating existing review:", existingReviewDoc.id);

        await existingReviewDoc.ref.update({
          name: reviewData.name,
          photoUrl: reviewData.photoUrl,
          rating: reviewData.rating,
          text: reviewData.text,
          updateTime: reviewData.updateTime,
          isAnonymous: reviewData.isAnonymous,
        });

        console.log("Review updated successfully:", existingReviewDoc.id);
      } else {
        // Create new review - this will trigger onReviewCreate function
        console.log("Creating new review");
        const newReviewRef = await reviewsRef.add(reviewData);
        console.log("Review created successfully:", newReviewRef.id);
      }
    } catch (error) {
      console.error("Error processing Google review notification:", error);
      throw error;
    }
  }
);

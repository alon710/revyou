import * as admin from "firebase-admin";
import { onMessagePublished } from "firebase-functions/v2/pubsub";
import { defineSecret } from "firebase-functions/params";
import {
  getReview,
  starRatingToNumber,
  parseGoogleTimestamp,
} from "../shared/google/reviews";
import { decryptToken } from "../shared/google/business-profile";
import type { Review, Business } from "../shared/types/database";

const db = admin.firestore();
const tokenEncryptionSecret = defineSecret("TOKEN_ENCRYPTION_SECRET");
const googleClientId = defineSecret("GOOGLE_CLIENT_ID");
const googleClientSecret = defineSecret("GOOGLE_CLIENT_SECRET");

interface PubSubNotificationData {
  type: "NEW_REVIEW";
  review: string;
  location: string;
}

function extractLocationId(locationName: string): string {
  const parts = locationName.split("/");
  const locationIndex = parts.indexOf("locations");
  if (locationIndex === -1 || locationIndex + 1 >= parts.length) {
    throw new Error(`Invalid location name format: ${locationName}`);
  }
  return parts[locationIndex + 1];
}

async function findBusinessByLocationId(locationName: string): Promise<{
  userId: string;
  accountId: string;
  business: Business;
} | null> {
  try {
    const locationId = extractLocationId(locationName);
    console.log("Searching for business with locationId:", locationId);

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
            business: { id: businessDoc.id, ...businessDoc.data() } as Business,
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
      const notificationJson = Buffer.from(messageData, "base64").toString(
        "utf-8"
      );
      const notification: PubSubNotificationData = JSON.parse(notificationJson);

      console.log("Parsed notification:", notification);

      const {
        type: notificationType,
        review: reviewName,
        location: locationName,
      } = notification;

      if (notificationType !== "NEW_REVIEW") {
        console.log("Ignoring non-new-review notification:", notificationType);
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
        console.log(
          "Business not connected, skipping notification:",
          business.id
        );
        return;
      }

      const encryptedToken = await getAccountRefreshToken(userId, accountId);
      if (!encryptedToken) {
        console.error("No refresh token found for account:", accountId);
        return;
      }

      const refreshToken = await decryptToken(
        encryptedToken,
        tokenEncryptionSecret.value()
      );

      console.log("Fetching review from GMB API:", reviewName);
      const googleReview = await getReview(
        reviewName,
        refreshToken,
        googleClientId.value(),
        googleClientSecret.value()
      );
      console.log("Fetched Google review:", googleReview);

      const reviewData: Omit<Review, "id"> = {
        googleReviewId: googleReview.reviewId,
        googleReviewName: googleReview.name,
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
        isAnonymous: googleReview.reviewer.isAnonymous ?? false,
        replyStatus: "pending",
        postedReply: null,
        postedAt: null,
        postedBy: null,
      };

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
        const existingReviewDoc = existingReviewSnapshot.docs[0];
        console.log("Review already exists, skipping:", existingReviewDoc.id);
        return;
      }

      console.log("Creating new review");
      const newReviewRef = await reviewsRef.add(reviewData);
      console.log("Review created successfully:", newReviewRef.id);
    } catch (error) {
      console.error("Error processing Google review notification:", error);
      throw error;
    }
  }
);

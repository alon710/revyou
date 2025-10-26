import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface PubSubMessage {
  data: string; // Base64 encoded
  attributes?: Record<string, string>;
}

interface ReviewNotification {
  locationResourceName: string;
  reviewResourceName: string;
  notificationType: "NEW_REVIEW" | "UPDATED_REVIEW";
}

/**
 * Cloud Function to receive Pub/Sub notifications about new reviews
 * Triggered by push subscription from Google Business Profile
 */
export const onReviewNotification = functions.onRequest(
  { cors: true },
  async (req, res) => {
    try {
      // Verify it's a POST request
      if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
      }

      // Parse Pub/Sub message
      const pubsubMessage: PubSubMessage = req.body.message;

      if (!pubsubMessage || !pubsubMessage.data) {
        logger.warn("No Pub/Sub message data");
        res.status(400).send("Bad Request");
        return;
      }

      // Decode message data
      const decodedData = Buffer.from(pubsubMessage.data, "base64").toString();
      const notification: ReviewNotification = JSON.parse(decodedData);

      logger.info("Received review notification:", notification);

      // Extract location and review IDs from resource names
      const locationMatch =
        notification.locationResourceName.match(/locations\/([^/]+)/);
      const reviewMatch =
        notification.reviewResourceName.match(/reviews\/([^/]+)/);

      if (!locationMatch || !reviewMatch) {
        logger.error("Invalid resource names in notification");
        res.status(400).send("Invalid resource names");
        return;
      }

      const locationId = locationMatch[1];
      const reviewId = reviewMatch[1];

      logger.info(`Processing review ${reviewId} for location ${locationId}`);

      // Find the business in Firestore by googleLocationId using collectionGroup
      const businessQuery = await db
        .collectionGroup("businesses")
        .where("googleLocationId", "==", locationId)
        .limit(1)
        .get();

      if (businessQuery.empty) {
        logger.warn(`No business found for location ${locationId}`);
        res.status(200).send("OK"); // Return 200 to avoid retry
        return;
      }

      const businessDoc = businessQuery.docs[0];
      const businessId = businessDoc.id;

      // Extract userId from the document path
      // Path is: users/{userId}/businesses/{businessId}
      const userId = businessDoc.ref.parent.parent?.id;

      if (!userId) {
        logger.error("Could not extract userId from business document path");
        res.status(500).send("Internal Server Error");
        return;
      }

      logger.info(`Found business ${businessId} for user ${userId}`);

      // Check if review already exists using collectionGroup
      const existingReview = await db
        .collectionGroup("reviews")
        .where("googleReviewId", "==", reviewId)
        .limit(1)
        .get();

      if (!existingReview.empty) {
        logger.info(`Review ${reviewId} already exists, skipping`);
        res.status(200).send("OK");
        return;
      }

      // Extract review details from notification attributes
      const attrs = pubsubMessage.attributes || {};

      // Parse star rating from notification
      let rating = 0;
      if (attrs.starRating) {
        // Google sends star rating as "FIVE", "FOUR", etc.
        const ratingMap: Record<string, number> = {
          ONE: 1,
          TWO: 2,
          THREE: 3,
          FOUR: 4,
          FIVE: 5,
        };
        rating = ratingMap[attrs.starRating] || 0;
      }

      // Create review document in Firestore (no longer need businessId field as it's in the path)
      const reviewData = {
        googleReviewId: reviewId,
        reviewerName: attrs.reviewerDisplayName || "לקוח אנונימי",
        reviewerPhotoUrl: attrs.reviewerProfilePhotoUrl || null,
        rating,
        reviewText: attrs.comment || "",
        reviewDate: admin.firestore.Timestamp.now(),
        receivedAt: admin.firestore.Timestamp.now(),
        replyStatus: "pending",
        wasEdited: false,
      };

      await db
        .collection("users")
        .doc(userId)
        .collection("businesses")
        .doc(businessId)
        .collection("reviews")
        .doc(reviewId)
        .set(reviewData);

      logger.info(
        `Created review document for ${reviewId} in user ${userId} business ${businessId}`
      );

      // The Firestore trigger will now handle AI generation
      res.status(200).send("OK");
    } catch (error) {
      logger.error("Error processing review notification:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface PubSubMessage {
  data: string;
  attributes?: Record<string, string>;
}

interface ReviewNotification {
  locationResourceName: string;
  reviewResourceName: string;
  notificationType: "NEW_REVIEW" | "UPDATED_REVIEW";
}

export const onReviewNotification = functions.onRequest(
  { cors: true },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
      }

      const pubsubMessage: PubSubMessage = req.body.message;

      if (!pubsubMessage || !pubsubMessage.data) {
        logger.warn("No Pub/Sub message data");
        res.status(400).send("Bad Request");
        return;
      }

      const decodedData = Buffer.from(pubsubMessage.data, "base64").toString();
      const notification: ReviewNotification = JSON.parse(decodedData);

      logger.info("Received review notification:", notification);

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

      const businessQuery = await db
        .collectionGroup("locations")
        .where("googleLocationId", "==", locationId)
        .limit(1)
        .get();

      if (businessQuery.empty) {
        logger.warn(`No location found for location ${locationId}`);
        res.status(200).send("OK");
        return;
      }

      const businessDoc = businessQuery.docs[0];
      const firestoreLocationId = businessDoc.id;

      const userId = businessDoc.ref.parent.parent?.id;

      if (!userId) {
        logger.error("Could not extract userId from location document path");
        res.status(500).send("Internal Server Error");
        return;
      }

      logger.info(`Found location ${firestoreLocationId} for user ${userId}`);

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

      const attrs = pubsubMessage.attributes || {};

      let rating = 0;
      if (attrs.starRating) {
        const ratingMap: Record<string, number> = {
          ONE: 1,
          TWO: 2,
          THREE: 3,
          FOUR: 4,
          FIVE: 5,
        };
        rating = ratingMap[attrs.starRating] || 0;
      }

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
        .collection("locations")
        .doc(firestoreLocationId)
        .collection("reviews")
        .doc(reviewId)
        .set(reviewData);

      logger.info(
        `Created review document for ${reviewId} in user ${userId} location ${firestoreLocationId}`
      );

      res.status(200).send("OK");
    } catch (error) {
      logger.error("Error processing review notification:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

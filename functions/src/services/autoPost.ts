import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { OAuth2Client } from "google-auth-library";

const db = admin.firestore();

/**
 * Decrypt Google refresh token
 * TODO: Implement proper encryption/decryption in production
 * For now, assumes token is stored as base64
 */
function decryptToken(encryptedToken: string): string {
  try {
    return Buffer.from(encryptedToken, "base64").toString("utf-8");
  } catch (error) {
    logger.error("Error decrypting token:", error);
    return encryptedToken; // Return as-is if decryption fails
  }
}

/**
 * Auto-post reply to Google Business Profile
 * @param userId - User who owns the location
 * @param businessId - Location ID
 * @param reviewId - Firestore review document ID
 */
export async function autoPostReply(
  userId: string,
  businessId: string,
  reviewId: string
): Promise<void> {
  try {
    logger.info(
      `Starting auto-post for review ${reviewId} in location ${businessId} for user ${userId}`
    );

    // Get review data
    const reviewDoc = await db
      .collection("users")
      .doc(userId)
      .collection("locations")
      .doc(businessId)
      .collection("reviews")
      .doc(reviewId)
      .get();

    if (!reviewDoc.exists) {
      throw new Error("Review not found");
    }

    const review = reviewDoc.data();
    if (!review) {
      throw new Error("Review data is empty");
    }

    // Get location data
    const businessDoc = await db
      .collection("users")
      .doc(userId)
      .collection("locations")
      .doc(businessId)
      .get();

    if (!businessDoc.exists) {
      throw new Error("Business not found");
    }

    const location = businessDoc.data();
    if (!location) {
      throw new Error("Business data is empty");
    }

    // Get user's Google refresh token
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const user = userDoc.data();
    const refreshToken = user?.googleRefreshToken;

    if (!refreshToken) {
      throw new Error("No Google refresh token found");
    }

    // Decrypt token
    const decryptedToken = decryptToken(refreshToken);

    // Setup OAuth client
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({ refresh_token: decryptedToken });

    // Refresh access token
    await oauth2Client.refreshAccessToken();

    // Determine which reply to post (edited takes precedence)
    const replyText = review.editedReply || review.aiReply;

    if (!replyText) {
      throw new Error("No reply text to post");
    }

    // Construct review resource name
    // Format: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
    const reviewName = `accounts/${location.googleAccountId}/locations/${location.googleLocationId}/reviews/${review.googleReviewId}`;

    logger.info(`Posting reply to ${reviewName}`);

    // Post reply using Google Business Profile API
    // Note: Using direct API call as the googleapis library may not have the reviews endpoint
    await oauth2Client.request({
      url: `https://mybusiness.googleapis.com/v4/${reviewName}/reply`,
      method: "PUT",
      data: {
        comment: replyText,
      },
    });

    logger.info(`Successfully posted reply for review ${reviewId}`);

    // Update review as posted
    await db
      .collection("users")
      .doc(userId)
      .collection("locations")
      .doc(businessId)
      .collection("reviews")
      .doc(reviewId)
      .update({
        replyStatus: "posted",
        postedReply: replyText,
        postedAt: admin.firestore.FieldValue.serverTimestamp(),
        postedBy: userId,
      });
  } catch (error) {
    logger.error("Error auto-posting reply:", error);

    // Mark as failed
    try {
      await db
        .collection("users")
        .doc(userId)
        .collection("locations")
        .doc(businessId)
        .collection("reviews")
        .doc(reviewId)
        .update({
          replyStatus: "failed",
        });
    } catch (updateError) {
      logger.error("Error updating review status to failed:", updateError);
    }

    throw error;
  }
}

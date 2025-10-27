import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

interface ReviewUsageStats {
  reviewsThisMonth: number;
  resetDate: string;
}

/**
 * Callable Cloud Function to get review usage statistics
 * This runs with admin privileges to properly query across collections
 */
export const getReviewUsageStats = onCall<ReviewUsageStats>(async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to get usage stats"
    );
  }

  const userId = request.auth.uid;

  try {
    const db = admin.firestore();

    // Get the start of the current billing month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);

    // Calculate reset date (start of next month)
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const resetDate = new Date(nextYear, nextMonth, 1, 0, 0, 0, 0);

    // Get all connected businesses for this user
    const businessesSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("locations")
      .where("connected", "==", true)
      .get();

    const businessIds = businessesSnapshot.docs.map((doc) => doc.id);

    if (businessIds.length === 0) {
      return {
        reviewsThisMonth: 0,
        resetDate: resetDate.toISOString(),
      };
    }

    // Count reviews for all user's businesses in current period
    // With the new structure, we iterate through each location subcollection
    let totalReviews = 0;

    for (const businessId of businessIds) {
      const reviewsSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("locations")
        .doc(businessId)
        .collection("reviews")
        .where(
          "receivedAt",
          ">=",
          admin.firestore.Timestamp.fromDate(startOfMonth)
        )
        .get();

      totalReviews += reviewsSnapshot.size;
    }

    return {
      reviewsThisMonth: totalReviews,
      resetDate: resetDate.toISOString(),
    };
  } catch (error) {
    console.error("Error getting review usage stats:", error);
    throw new HttpsError("internal", "Failed to get usage statistics");
  }
});

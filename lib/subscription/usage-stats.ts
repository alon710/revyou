import { db, auth } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { startOfMonth } from "date-fns";
import type { PlanLimits } from "@/lib/stripe/entitlements";

export async function getReviewCountThisMonth(): Promise<number> {
  if (!auth?.currentUser || !db) {
    console.error("User not authenticated or Firestore not initialized");
    return 0;
  }

  try {
    const userId = auth.currentUser.uid;
    const startDate = startOfMonth(new Date());

    const businessesQuery = query(
      collection(db, "users", userId, "businesses"),
      where("connected", "==", true)
    );
    const businessesSnapshot = await getDocs(businessesQuery);
    const businessIds = businessesSnapshot.docs.map((doc) => doc.id);

    if (businessIds.length === 0) {
      return 0;
    }

    const reviewCountPromises = businessIds.map(async (businessId) => {
      const reviewsQuery = query(
        collection(db!, "users", userId, "businesses", businessId, "reviews"),
        where("receivedAt", ">=", Timestamp.fromDate(startDate))
      );
      const snapshot = await getDocs(reviewsQuery);
      return snapshot.size;
    });

    const reviewCounts = await Promise.all(reviewCountPromises);
    return reviewCounts.reduce((sum, count) => sum + count, 0);
  } catch (error) {
    console.error("Error getting review count:", error);
    return 0;
  }
}

export function getUsagePercentages(
  currentBusiness: number,
  currentReviews: number,
  limits: PlanLimits
): {
  businessesPercent: number;
  reviewsPercent: number;
} {
  const businessesPercent = Math.min(
    100,
    Math.round((currentBusiness / limits.businesses) * 100)
  );

  const reviewsPercent = Math.min(
    100,
    Math.round((currentReviews / limits.reviewsPerMonth) * 100)
  );

  return {
    businessesPercent,
    reviewsPercent,
  };
}

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

    const locationsQuery = query(
      collection(db, "users", userId, "locations"),
      where("connected", "==", true)
    );
    const locationsSnapshot = await getDocs(locationsQuery);
    const locationIds = locationsSnapshot.docs.map((doc) => doc.id);

    if (locationIds.length === 0) {
      return 0;
    }

    const reviewCountPromises = locationIds.map(async (locationId) => {
      const reviewsQuery = query(
        collection(db!, "users", userId, "locations", locationId, "reviews"),
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
  currentLocations: number,
  currentReviews: number,
  limits: PlanLimits
): {
  locationsPercent: number;
  reviewsPercent: number;
} {
  const locationsPercent = Math.min(
    100,
    Math.round((currentLocations / limits.locations) * 100)
  );

  const reviewsPercent = Math.min(
    100,
    Math.round((currentReviews / limits.reviewsPerMonth) * 100)
  );

  return {
    locationsPercent,
    reviewsPercent,
  };
}

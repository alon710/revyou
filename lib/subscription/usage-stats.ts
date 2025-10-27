import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/config";
import type { PlanLimits } from "@/lib/stripe/entitlements";

interface ReviewUsageStats {
  reviewsThisMonth: number;
  resetDate: string;
}

export async function getReviewCountThisMonth(): Promise<number> {
  if (!functions) {
    console.error("Firebase Functions not initialized");
    return 0;
  }

  try {
    const getReviewUsageStatsCallable = httpsCallable<
      Record<string, never>,
      ReviewUsageStats
    >(functions, "getReviewUsageStats");

    const result = await getReviewUsageStatsCallable({});

    return result.data.reviewsThisMonth;
  } catch (error) {
    console.error("Error getting review count:", error);
    return 0;
  }
}

export function getUsagePercentages(
  currentBusinesses: number,
  currentReviews: number,
  limits: PlanLimits
): {
  businessesPercent: number;
  reviewsPercent: number;
} {
  const businessesPercent = Math.min(
    100,
    Math.round((currentBusinesses / limits.businesses) * 100)
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

export function getUsageColor(percentage: number): string {
  if (percentage >= 90) return "text-destructive";
  if (percentage >= 70) return "text-yellow-600 dark:text-yellow-500";
  return "text-green-600 dark:text-green-500";
}

import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/config";
import { SUBSCRIPTION_LIMITS } from "@/types/database";
import type { PlanType } from "@/lib/stripe/config";

interface ReviewUsageStats {
  reviewsThisMonth: number;
  resetDate: string;
}

/**
 * Get the start and end of the current billing month
 * Billing month starts on the 1st of each month
 */
export function getCurrentBillingPeriod(): {
  start: Date;
  end: Date;
  resetDate: Date;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Start of current month
  const start = new Date(year, month, 1, 0, 0, 0, 0);

  // Start of next month (end of current period)
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const end = new Date(nextYear, nextMonth, 1, 0, 0, 0, 0);

  // Reset date is the same as the end date (start of next month)
  const resetDate = new Date(end);

  return { start, end, resetDate };
}

/**
 * Count reviews for a user in the current billing period
 * Uses Cloud Function to properly query with admin privileges
 * @param userId - User ID (not used - function gets it from auth context)
 * @returns Number of reviews this month
 */
export async function getReviewCountThisMonth(): Promise<number> {
  if (!functions) {
    console.error("Firebase Functions not initialized");
    return 0;
  }

  try {
    // Call Cloud Function with admin privileges
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

/**
 * Get usage percentages for a plan
 */
export function getUsagePercentages(
  currentBusinesses: number,
  currentReviews: number,
  planType: PlanType
): {
  businessesPercent: number;
  reviewsPercent: number;
} {
  const limits = SUBSCRIPTION_LIMITS[planType];

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

/**
 * Get usage color based on percentage
 */
export function getUsageColor(percentage: number): string {
  if (percentage >= 90) return "text-destructive";
  if (percentage >= 70) return "text-yellow-600 dark:text-yellow-500";
  return "text-green-600 dark:text-green-500";
}

/**
 * Format date in Hebrew
 */
export function formatHebrewDate(date: Date): string {
  const day = date.getDate();
  const monthNames = [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ב${month} ${year}`;
}

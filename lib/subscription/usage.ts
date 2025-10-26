import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/config";
import type { PlanLimits } from "@/lib/stripe/entitlements";

interface ReviewUsageStats {
  reviewsThisMonth: number;
  resetDate: string;
}

export function getCurrentBillingPeriod(): {
  start: Date;
  end: Date;
  resetDate: Date;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const start = new Date(year, month, 1, 0, 0, 0, 0);

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const end = new Date(nextYear, nextMonth, 1, 0, 0, 0, 0);

  const resetDate = new Date(end);

  return { start, end, resetDate };
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

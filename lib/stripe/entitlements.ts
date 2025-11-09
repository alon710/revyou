import type { EnrichedProduct } from "@/lib/stripe/product-parser";
import { FEATURE_KEYS } from "@/lib/stripe/feature-config";

export type PlanType = "free" | "basic" | "pro";
export type BillingPeriod = "monthly" | "yearly";

export interface PlanLimits {
  businesses: number;
  reviewsPerMonth: number;
  autoPost: boolean;
  requireApproval: boolean;
}

export function getPlanLimits(product: EnrichedProduct): PlanLimits {
  const features = product.features;

  const businesses = (features[FEATURE_KEYS.MAX_BUSINESSES] as number) || 1;
  const reviewsPerMonth = (features[FEATURE_KEYS.MONTHLY_REVIEWS] as number) || 5;
  const autoPost = (features[FEATURE_KEYS.AUTO_PUBLISH] as boolean) || false;

  const manualApproval = features[FEATURE_KEYS.MANUAL_APPROVAL];
  const requireApproval =
    manualApproval === "חובה" || manualApproval === "required" || manualApproval === "true" || manualApproval === true;

  return {
    businesses,
    reviewsPerMonth,
    autoPost,
    requireApproval,
  };
}

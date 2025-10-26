import type { EnrichedProduct } from "./product-parser";
import { FEATURE_KEYS } from "./feature-config";

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
  const reviewsPerMonth =
    (features[FEATURE_KEYS.MONTHLY_REVIEWS] as number) || 5;
  const autoPost = (features[FEATURE_KEYS.AUTO_PUBLISH] as boolean) || false;

  const manualApproval = features[FEATURE_KEYS.MANUAL_APPROVAL];
  const requireApproval =
    manualApproval === "חובה" ||
    manualApproval === "required" ||
    manualApproval === "true" ||
    manualApproval === true;

  return {
    businesses,
    reviewsPerMonth,
    autoPost,
    requireApproval,
  };
}

export type { EnrichedProduct } from "./product-parser";
export { FEATURE_KEYS } from "./feature-config";
export type { FeatureConfig } from "./feature-config";
export { FEATURE_CONFIGS } from "./feature-config";
export { extractFeatures, formatFeatureValue } from "./feature-config";
export {
  getPlanId,
  isRecommended,
  enrichProduct,
  sortProductsByPlan,
} from "./product-parser";
export { getMonthlyPrice, getYearlyPrice, getPriceId } from "./pricing";

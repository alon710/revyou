import type { Product, Price } from "@invertase/firestore-stripe-payments";

export type PlanType = "free" | "basic" | "pro";
export type BillingPeriod = "monthly" | "yearly";

export interface PlanLimits {
  businesses: number;
  reviewsPerMonth: number;
  autoPost: boolean;
  requireApproval: boolean;
}

export const FEATURE_KEYS = {
  MAX_BUSINESSES: "max_businesses",
  MONTHLY_REVIEWS: "monthly_reviews",
  MANUAL_APPROVAL: "manual_approval",
  AUTO_PUBLISH: "auto_publish",
  WHATSAPP_SUPPORT: "whatsapp_support",
} as const;

export interface FeatureConfig {
  key: string;
  displayName: string;
  type: "number" | "text" | "boolean";
}

export const FEATURE_CONFIGS: FeatureConfig[] = [
  {
    key: FEATURE_KEYS.MAX_BUSINESSES,
    displayName: "מספר עסקים",
    type: "number",
  },
  {
    key: FEATURE_KEYS.MONTHLY_REVIEWS,
    displayName: "ביקורות בחודש",
    type: "number",
  },
  {
    key: FEATURE_KEYS.MANUAL_APPROVAL,
    displayName: "אישור ידני",
    type: "boolean",
  },
  {
    key: FEATURE_KEYS.AUTO_PUBLISH,
    displayName: "פרסום אוטומטי",
    type: "boolean",
  },
  {
    key: FEATURE_KEYS.WHATSAPP_SUPPORT,
    displayName: "תמיכה בוואטסאפ",
    type: "boolean",
  },
];

export interface EnrichedProduct extends Omit<Product, "prices"> {
  prices?: Price[];
  features: Record<string, string | number | boolean>;
  planId: string;
  recommended?: boolean;
}

export function extractFeatures(
  product: Product
): Record<string, string | number | boolean> {
  const features: Record<string, string | number | boolean> = {};

  if (!product.metadata) {
    return features;
  }

  for (const config of FEATURE_CONFIGS) {
    const value = product.metadata[config.key];

    if (value !== undefined && value !== null) {
      switch (config.type) {
        case "number":
          features[config.key] = parseInt(value as string, 10) || 0;
          break;
        case "boolean":
          features[config.key] =
            value === "true" ||
            (typeof value === "boolean" && value === true) ||
            value === "1";
          break;
        case "text":
        default:
          features[config.key] = value as string;
          break;
      }
    }
  }

  return features;
}

export function getPlanId(product: Product): string {
  if (product.metadata?.plan_id) {
    return product.metadata.plan_id as string;
  }

  const name = product.name?.toLowerCase() || "";

  if (name.includes("בסיסי") || name.includes("basic")) {
    return "basic";
  }
  if (name.includes("פרו") || name.includes("pro") || name.includes("מקצועי")) {
    return "pro";
  }
  if (name.includes("חינם") || name.includes("free")) {
    return "free";
  }

  return "unknown";
}

export function isRecommended(product: Product): boolean {
  const recommended = product.metadata?.recommended;
  return (
    recommended === "true" ||
    (typeof recommended === "boolean" && recommended === true)
  );
}

export function sortProductsByPlan(
  products: EnrichedProduct[]
): EnrichedProduct[] {
  const planOrder: Record<string, number> = {
    free: 0,
    basic: 1,
    pro: 2,
  };

  return products.sort((a, b) => {
    const orderA = planOrder[a.planId] ?? 999;
    const orderB = planOrder[b.planId] ?? 999;
    return orderA - orderB;
  });
}

export function enrichProduct(product: Product): EnrichedProduct {
  return {
    ...product,
    features: extractFeatures(product),
    planId: getPlanId(product),
    recommended: isRecommended(product),
  };
}

export function formatFeatureValue(
  value: string | number | boolean | undefined | null,
  type: "number" | "text" | "boolean"
): string | boolean {
  if (value === undefined || value === null) {
    switch (type) {
      case "number":
        return "0";
      case "boolean":
        return false;
      case "text":
      default:
        return "";
    }
  }

  switch (type) {
    case "number":
      return typeof value === "number"
        ? value.toLocaleString("he-IL")
        : value.toString();
    case "boolean":
      return Boolean(value);
    case "text":
    default:
      return value.toString();
  }
}

export function getMonthlyPrice(product: EnrichedProduct): number {
  if (!product.prices || product.prices.length === 0) {
    return 0;
  }

  const monthlyPrice = product.prices.find(
    (price) =>
      price.type === "recurring" &&
      price.interval === "month" &&
      price.active !== false
  );

  if (monthlyPrice?.unit_amount) {
    return monthlyPrice.unit_amount / 100;
  }

  return 0;
}

export function getYearlyPrice(product: EnrichedProduct): number {
  if (!product.prices || product.prices.length === 0) {
    return 0;
  }

  const yearlyPrice = product.prices.find(
    (price) =>
      price.type === "recurring" &&
      price.interval === "year" &&
      price.active !== false
  );

  if (yearlyPrice?.unit_amount) {
    return yearlyPrice.unit_amount / 100 / 12;
  }

  return 0;
}

export function getPriceId(
  product: EnrichedProduct,
  period: "monthly" | "yearly"
): string | null {
  if (!product.prices || product.prices.length === 0) {
    return null;
  }

  const interval = period === "monthly" ? "month" : "year";

  const price = product.prices.find(
    (p) =>
      p.type === "recurring" && p.interval === interval && p.active !== false
  );

  return price?.id || null;
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

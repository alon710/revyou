import type { Product } from "@invertase/firestore-stripe-payments";

export const FEATURE_KEYS = {
  MAX_LOCATIONS: "max_locations",
  MONTHLY_REVIEWS: "monthly_reviews",
  MANUAL_APPROVAL: "manual_approval",
  AUTO_PUBLISH: "auto_publish",
  WHATSAPP_SUPPORT: "whatsapp_support",
} as const;

interface FeatureConfig {
  key: string;
  displayName: string;
  type: "number" | "text" | "boolean";
}

export const FEATURE_CONFIGS: FeatureConfig[] = [
  {
    key: FEATURE_KEYS.MAX_LOCATIONS,
    displayName: "מספר מיקומים",
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

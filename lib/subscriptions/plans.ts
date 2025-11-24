export type PlanTier = "free" | "basic" | "pro";

export interface PlanLimits {
  businesses: number;
  reviewsPerMonth: number;
  autoPost: boolean;
  requireApproval: boolean;
  analytics: boolean;
}

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: PlanTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: PlanLimits;
}

export const PLANS: Record<PlanTier, Plan> = {
  free: {
    id: "free",
    name: "Free",
    description: "Get started with basic features",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [],
    limits: {
      businesses: 1,
      reviewsPerMonth: 10,
      autoPost: false,
      requireApproval: true,
      analytics: false,
    },
  },
  basic: {
    id: "basic",
    name: "Basic",
    description: "Perfect for small businesses",
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [],
    limits: {
      businesses: 3,
      reviewsPerMonth: 100,
      autoPost: true,
      requireApproval: false,
      analytics: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "For growing businesses",
    monthlyPrice: 79,
    yearlyPrice: 790,
    features: [],
    limits: {
      businesses: 5,
      reviewsPerMonth: 250,
      autoPost: true,
      requireApproval: false,
      analytics: true,
    },
  },
};

export function getPlanLimits(planTier: PlanTier): PlanLimits {
  return PLANS[planTier].limits;
}

export function getPlan(planTier: PlanTier): Plan {
  return PLANS[planTier];
}

type FeatureKey = keyof PlanLimits;

interface FeatureConfig {
  translationKey: string;
  getValue?: (limits: PlanLimits) => string | number;
}

const FEATURE_DISPLAY_ORDER: FeatureKey[] = [
  "businesses",
  "reviewsPerMonth",
  "autoPost",
  "requireApproval",
  "analytics",
];

const FEATURE_CONFIGS: Partial<Record<FeatureKey, FeatureConfig>> = {
  businesses: {
    translationKey: "features.businesses",
    getValue: (limits) => limits.businesses,
  },
  reviewsPerMonth: {
    translationKey: "features.reviews",
    getValue: (limits) => limits.reviewsPerMonth,
  },
  autoPost: {
    translationKey: "features.autoPost",
  },
  requireApproval: {
    translationKey: "features.manualApproval",
  },
  analytics: {
    translationKey: "features.analytics",
  },
};

export function getAllPlans(t: (key: string, params?: Record<string, string | number | Date>) => string): Plan[] {
  const plans = Object.values(PLANS);

  return plans.map((plan) => {
    const features: string[] = [];

    FEATURE_DISPLAY_ORDER.forEach((key) => {
      const limitValue = plan.limits[key];
      const config = FEATURE_CONFIGS[key];

      if (!config) return;

      if (limitValue === undefined || limitValue === null) return;

      const value = config.getValue ? config.getValue(plan.limits) : undefined;

      features.push(t(config.translationKey, value !== undefined ? { count: value } : undefined));
    });

    return {
      ...plan,
      name: t(`plans.${plan.id}.name`),
      description: t(`plans.${plan.id}.description`),
      features,
    };
  });
}

export function calculateYearlySavings(planTier: PlanTier): number {
  const plan = PLANS[planTier];
  const monthlyTotal = plan.monthlyPrice * 12;
  const yearlySavings = monthlyTotal - plan.yearlyPrice;
  return yearlySavings;
}

export function calculateYearlySavingsPercentage(planTier: PlanTier): number {
  const plan = PLANS[planTier];
  if (plan.monthlyPrice === 0) return 0;
  const monthlyTotal = plan.monthlyPrice * 12;
  const savingsPercentage = ((monthlyTotal - plan.yearlyPrice) / monthlyTotal) * 100;
  return Math.round(savingsPercentage);
}

export type PlanTier = "free" | "basic" | "pro";

export interface PlanLimits {
  businesses: number;
  reviewsPerMonth: number;
  autoPost: boolean;
  requireApproval: boolean;
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
    features: ["1 business location", "10 AI replies per month", "Manual approval required", "Email support"],
    limits: {
      businesses: 1,
      reviewsPerMonth: 10,
      autoPost: false,
      requireApproval: true,
    },
  },
  basic: {
    id: "basic",
    name: "Basic",
    description: "Perfect for small businesses",
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      "Up to 3 business locations",
      "100 AI replies per month",
      "Auto-post replies",
      "Priority email support",
      "Custom tone of voice",
      "Emoji customization",
    ],
    limits: {
      businesses: 3,
      reviewsPerMonth: 100,
      autoPost: true,
      requireApproval: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "For growing businesses",
    monthlyPrice: 79,
    yearlyPrice: 790,
    features: [
      "Up to 5 business locations",
      "250 AI replies per month",
      "Auto-post replies",
      "WhatsApp support",
      "Custom tone of voice",
      "Emoji customization",
      "Advanced analytics",
      "Priority support",
    ],
    limits: {
      businesses: 5,
      reviewsPerMonth: 250,
      autoPost: true,
      requireApproval: false,
    },
  },
};

export function getPlanLimits(planTier: PlanTier): PlanLimits {
  return PLANS[planTier].limits;
}

export function getPlan(planTier: PlanTier): Plan {
  return PLANS[planTier];
}

export function getAllPlans(t?: (key: string) => string): Plan[] {
  const plans = Object.values(PLANS);

  if (!t) {
    return plans;
  }

  return plans.map((plan) => ({
    ...plan,
    name: t(`plans.${plan.id}.name`),
    description: t(`plans.${plan.id}.description`),
    features: plan.features.map((_, index) => t(`plans.${plan.id}.features.${index}`)),
  }));
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

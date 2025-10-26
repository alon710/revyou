// Stripe Configuration Types and Utilities
// This file only contains type definitions and helper functions
// Server-side Stripe operations are handled by the Firebase Extension

// Plan types
export type PlanType = "free" | "basic" | "professional";
export type BillingPeriod = "monthly" | "yearly";

/**
 * Get the plan type from a Stripe price ID
 * @param priceId - The Stripe price ID
 * @returns The corresponding plan type
 */
export function getPlanFromPriceId(priceId: string): PlanType {
  if (!priceId) return "free";

  const priceMap: Record<string, PlanType> = {
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY || ""]: "basic",
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_YEARLY || ""]: "basic",
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || ""]: "professional",
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || ""]: "professional",
  };

  const plan = priceMap[priceId];

  if (!plan) {
    console.warn(`Unknown price ID: ${priceId}, defaulting to free`);
    return "free";
  }

  return plan;
}

/**
 * Get the Stripe price ID for a plan and billing period
 * @param plan - The plan type
 * @param period - The billing period
 * @returns The Stripe price ID
 */
export function getStripePriceId(
  plan: PlanType,
  period: BillingPeriod
): string {
  const priceIds: Record<PlanType, Record<BillingPeriod, string>> = {
    free: {
      monthly: "",
      yearly: "",
    },
    basic: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY || "",
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_YEARLY || "",
    },
    professional: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "",
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || "",
    },
  };

  const priceId = priceIds[plan][period];

  if (!priceId) {
    throw new Error(
      `Missing Stripe price ID for plan: ${plan}, period: ${period}`
    );
  }

  return priceId;
}

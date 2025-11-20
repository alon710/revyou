import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
});

export const STRIPE_PRICE_IDS = {
  basic: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC_MONTHLY!,
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC_YEARLY!,
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY!,
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY!,
  },
} as const;

export function getStripePriceId(plan: "basic" | "pro", interval: "monthly" | "yearly"): string {
  const priceId = STRIPE_PRICE_IDS[plan]?.[interval];
  if (!priceId) {
    throw new Error(`Invalid plan/interval combination: ${plan}/${interval}`);
  }
  return priceId;
}

export function getPlanTierFromPriceId(priceId: string): "free" | "basic" | "pro" {
  if (priceId === STRIPE_PRICE_IDS.basic.monthly || priceId === STRIPE_PRICE_IDS.basic.yearly) {
    return "basic";
  }

  if (priceId === STRIPE_PRICE_IDS.pro.monthly || priceId === STRIPE_PRICE_IDS.pro.yearly) {
    return "pro";
  }

  return "free";
}

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

const BASIC_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC_MONTHLY;
const BASIC_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC_YEARLY;
const PRO_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY;
const PRO_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY;

const missingPriceIds = [
  { name: "NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC_MONTHLY", value: BASIC_MONTHLY },
  { name: "NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC_YEARLY", value: BASIC_YEARLY },
  { name: "NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY", value: PRO_MONTHLY },
  { name: "NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY", value: PRO_YEARLY },
].filter((env) => !env.value);

if (missingPriceIds.length > 0) {
  const missing = missingPriceIds.map((env) => env.name).join(", ");
  throw new Error(
    `Missing required Stripe price ID environment variable(s): ${missing}`
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
});

export const STRIPE_PRICE_IDS = {
  basic: {
    monthly: BASIC_MONTHLY!,
    yearly: BASIC_YEARLY!,
  },
  pro: {
    monthly: PRO_MONTHLY!,
    yearly: PRO_YEARLY!,
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

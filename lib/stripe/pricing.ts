import type { EnrichedProduct } from "@/lib/stripe/product-parser";

export function getMonthlyPrice(product: EnrichedProduct): number {
  if (!product.prices || product.prices.length === 0) {
    return 0;
  }

  const monthlyPrice = product.prices.find(
    (price) => price.type === "recurring" && price.interval === "month" && price.active !== false
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
    (price) => price.type === "recurring" && price.interval === "year" && price.active !== false
  );

  if (yearlyPrice?.unit_amount) {
    return yearlyPrice.unit_amount / 100 / 12;
  }

  return 0;
}

export function getPriceId(product: EnrichedProduct, period: "monthly" | "yearly"): string | null {
  if (!product.prices || product.prices.length === 0) {
    return null;
  }

  const interval = period === "monthly" ? "month" : "year";

  const price = product.prices.find((p) => p.type === "recurring" && p.interval === interval && p.active !== false);

  return price?.id || null;
}

import type { Product, Price } from "@invertase/firestore-stripe-payments";
import { extractFeatures } from "@/lib/stripe/feature-config";

export interface EnrichedProduct extends Omit<Product, "prices"> {
  prices?: Price[];
  features: Record<string, string | number | boolean>;
  planId: string;
  recommended?: boolean;
}

function getPlanId(product: Product): string {
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

function isRecommended(product: Product): boolean {
  const recommended = product.metadata?.recommended;
  return (
    recommended === "true" ||
    (typeof recommended === "boolean" && recommended === true)
  );
}

export function enrichProduct(product: Product): EnrichedProduct {
  return {
    ...product,
    features: extractFeatures(product),
    planId: getPlanId(product),
    recommended: isRecommended(product),
  };
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

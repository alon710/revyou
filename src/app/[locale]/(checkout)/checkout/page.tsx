import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import type { PlanTier } from "@/lib/subscriptions/plans";
import type { BillingInterval } from "@/lib/types/subscription.types";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plan?: string; period?: string }>;
}) {
  await params;
  const search = await searchParams;

  const plan = (search.plan as PlanTier) || null;
  const period = (search.period as BillingInterval) || null;

  return <CheckoutForm plan={plan} period={period} />;
}

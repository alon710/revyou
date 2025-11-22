"use client";

import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionManagementCard } from "./SubscriptionManagementCard";
import { PricingCards } from "./PricingCards";

export function Pricing() {
  const { subscription, planType, isActive } = useSubscription();

  const hasActivePaidSubscription = isActive && planType !== "free" && subscription?.stripeSubscriptionId;

  return (
    <>
      {hasActivePaidSubscription && subscription && <SubscriptionManagementCard subscription={subscription} />}
      <PricingCards />
    </>
  );
}

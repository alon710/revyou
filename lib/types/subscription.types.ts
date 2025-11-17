import type { PlanTier } from "@/lib/subscriptions/plans";

export type SubscriptionStatus = "active" | "canceled" | "expired";

export type BillingInterval = "monthly" | "yearly";

export interface Subscription {
  id: string;
  userId: string;
  planTier: PlanTier;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  createdAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date | null;
}

export type SubscriptionCreate = Omit<Subscription, "id">;
export type SubscriptionUpdate = Partial<Omit<Subscription, "id" | "userId">>;

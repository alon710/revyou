import type { Subscription as DrizzleSubscription, SubscriptionInsert } from "@/lib/db/schema";

export type SubscriptionStatus = "active" | "canceled" | "expired";

export type BillingInterval = "monthly" | "yearly";

export type Subscription = DrizzleSubscription;

export type SubscriptionCreate = Omit<SubscriptionInsert, "id" | "createdAt">;

export type SubscriptionUpdate = Partial<Omit<SubscriptionInsert, "id" | "accountId" | "createdAt">>;

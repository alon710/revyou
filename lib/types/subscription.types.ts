import type { Subscription as DrizzleSubscription, SubscriptionInsert } from "@/lib/db/schema";
import type Stripe from "stripe";

export type SubscriptionStatus = Stripe.Subscription.Status;

export type BillingInterval = "monthly" | "yearly";

export type Subscription = DrizzleSubscription;

export type SubscriptionCreate = Omit<SubscriptionInsert, "id" | "createdAt">;

export type SubscriptionUpdate = Partial<Omit<SubscriptionInsert, "id" | "userId" | "createdAt">>;

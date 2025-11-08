import type { Product } from "@invertase/firestore-stripe-payments";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "unpaid";

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  product: string | { id: string };
  price?: string | { id: string };
  created: Date;
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end?: boolean;
  canceled_at?: Date | null;
  trial_start?: Date | null;
  trial_end?: Date | null;
  metadata?: Record<string, unknown>;
}

export interface SubscriptionWithProduct extends Subscription {
  productData: Product;
}

export type SubscriptionCreate = Omit<Subscription, "id">;
export type SubscriptionUpdate = Partial<Omit<Subscription, "id">>;

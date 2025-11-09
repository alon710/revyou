"use client";

import {
  getStripePayments,
  createCheckoutSession,
  onCurrentUserSubscriptionUpdate,
  getProducts,
  type SubscriptionSnapshot,
} from "@invertase/firestore-stripe-payments";
import app from "@/lib/firebase/config";
import type { StripePayments } from "@invertase/firestore-stripe-payments";

let paymentsInstance: StripePayments | null = null;

function getPayments(): StripePayments {
  if (!paymentsInstance && app) {
    paymentsInstance = getStripePayments(app, {
      productsCollection: "products",
      customersCollection: "users",
    });
  }

  if (!paymentsInstance) {
    throw new Error("Firebase app not initialized");
  }

  return paymentsInstance;
}

export async function createSubscriptionCheckout(
  priceId: string,
  options?: {
    success_url?: string;
    cancel_url?: string;
  }
) {
  const payments = getPayments();

  return createCheckoutSession(payments, {
    price: priceId,
    success_url: options?.success_url || `${window.location.origin}/dashboard`,
    cancel_url: options?.cancel_url || `${window.location.origin}/`,
    allow_promotion_codes: true,
  });
}

export function onSubscriptionChange(callback: (snapshot: SubscriptionSnapshot) => void) {
  const payments = getPayments();

  return onCurrentUserSubscriptionUpdate(payments, callback);
}

export async function getAvailableProducts() {
  const payments = getPayments();

  return getProducts(payments, {
    includePrices: true,
    activeOnly: true,
  });
}

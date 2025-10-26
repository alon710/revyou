"use client";

import {
  getStripePayments,
  createCheckoutSession,
  getCurrentUserSubscriptions,
  onCurrentUserSubscriptionUpdate,
  getProducts,
  type SubscriptionSnapshot,
} from "@invertase/firestore-stripe-payments";
import app from "@/lib/firebase/config";
import type { StripePayments } from "@invertase/firestore-stripe-payments";

let paymentsInstance: StripePayments | null = null;

export function getPayments(): StripePayments {
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

export async function createSubscriptionCheckout(priceId: string) {
  const payments = getPayments();

  return createCheckoutSession(payments, {
    price: priceId,
    success_url: `${window.location.origin}/businesses`,
    cancel_url: `${window.location.origin}/`,
    allow_promotion_codes: true,
  });
}

export async function getActiveSubscriptions() {
  const payments = getPayments();

  return getCurrentUserSubscriptions(payments, {
    status: ["active", "trialing"],
  });
}

export function onSubscriptionChange(
  callback: (snapshot: SubscriptionSnapshot) => void
) {
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

export async function getCustomerPortalUrl(): Promise<string> {
  const response = await fetch("/api/stripe/create-portal-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to create customer portal session");
  }

  const data = await response.json();
  return data.url;
}

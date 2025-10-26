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

// Initialize Stripe Payments SDK
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

/**
 * Create a Stripe Checkout session for a subscription
 * @param priceId - The Stripe price ID for the subscription
 * @returns Promise resolving to the checkout session
 */
export async function createSubscriptionCheckout(priceId: string) {
  const payments = getPayments();

  return createCheckoutSession(payments, {
    price: priceId,
    success_url: `${window.location.origin}/payment/success`,
    cancel_url: `${window.location.origin}/payment/cancel`,
    allow_promotion_codes: true,
  });
}

/**
 * Get all active subscriptions for the current user
 * @returns Promise resolving to array of subscriptions
 */
export async function getActiveSubscriptions() {
  const payments = getPayments();

  return getCurrentUserSubscriptions(payments, {
    status: ["active", "trialing"],
  });
}

/**
 * Listen to real-time subscription changes for the current user
 * @param callback - Function called when subscriptions change
 * @returns Unsubscribe function
 */
export function onSubscriptionChange(
  callback: (snapshot: SubscriptionSnapshot) => void
) {
  const payments = getPayments();

  return onCurrentUserSubscriptionUpdate(payments, callback);
}

/**
 * Get all available products with prices from Firestore
 * @returns Promise resolving to array of products with prices
 */
export async function getAvailableProducts() {
  const payments = getPayments();

  return getProducts(payments, {
    includePrices: true,
    activeOnly: true,
  });
}

/**
 * Get Stripe Customer Portal URL
 * This requires a Cloud Function since portal sessions must be created server-side
 * @returns Promise resolving to the portal URL
 */
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

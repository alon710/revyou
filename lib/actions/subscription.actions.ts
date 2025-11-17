"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import type { BillingInterval, Subscription, SubscriptionCreate } from "@/lib/types/subscription.types";
import type { PlanTier } from "@/lib/subscriptions/plans";

/**
 * Creates a new subscription for the current user (mock payment)
 */
export async function createSubscription(
  planTier: PlanTier,
  billingInterval: BillingInterval = "monthly"
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  try {
    const { userId } = await getAuthenticatedUserId();

    // Calculate subscription period
    const now = new Date();
    const currentPeriodEnd = new Date(now);

    if (billingInterval === "monthly") {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    // Create subscription document
    const subscriptionData: SubscriptionCreate = {
      userId,
      planTier,
      status: "active",
      billingInterval,
      createdAt: now,
      currentPeriodStart: now,
      currentPeriodEnd,
      canceledAt: null,
    };

    // Add to Firestore
    const db = getAdminDb();
    const subscriptionRef = await db.collection("users").doc(userId).collection("subscriptions").add(subscriptionData);

    return {
      success: true,
      subscriptionId: subscriptionRef.id,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Gets the active subscription for the current user
 */
export async function getActiveSubscription(): Promise<Subscription | null> {
  try {
    const { userId } = await getAuthenticatedUserId();

    const db = getAdminDb();
    const subscriptionsSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("subscriptions")
      .where("status", "==", "active")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (subscriptionsSnapshot.empty) {
      return null;
    }

    const doc = subscriptionsSnapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      userId: data.userId,
      planTier: data.planTier,
      status: data.status,
      billingInterval: data.billingInterval,
      createdAt: data.createdAt.toDate(),
      currentPeriodStart: data.currentPeriodStart.toDate(),
      currentPeriodEnd: data.currentPeriodEnd.toDate(),
      canceledAt: data.canceledAt ? data.canceledAt.toDate() : null,
    };
  } catch (error) {
    console.error("Error getting active subscription:", error);
    return null;
  }
}

/**
 * Cancels the active subscription for the current user
 */
export async function cancelSubscription(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await getAuthenticatedUserId();

    const activeSubscription = await getActiveSubscription();
    if (!activeSubscription) {
      return { success: false, error: "No active subscription found" };
    }

    // Update subscription status
    const db = getAdminDb();
    await db.collection("users").doc(userId).collection("subscriptions").doc(activeSubscription.id).update({
      status: "canceled",
      canceledAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

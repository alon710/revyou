"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { SubscriptionsRepository, AccountsRepository } from "@/lib/db/repositories";
import type { BillingInterval } from "@/lib/types/subscription.types";
import type { PlanTier } from "@/lib/subscriptions/plans";
import type { Subscription } from "@/lib/db/schema";

export async function createSubscription(
  accountId: string,
  planTier: PlanTier,
  billingInterval: BillingInterval = "monthly"
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  try {
    const { userId } = await getAuthenticatedUserId();

    const accountRepo = new AccountsRepository(userId);
    const account = await accountRepo.get(accountId);
    if (!account) {
      return { success: false, error: "Account not found" };
    }

    const now = new Date();
    const currentPeriodEnd = new Date(now);

    if (billingInterval === "monthly") {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    const repo = new SubscriptionsRepository();
    const subscription = await repo.upsert(accountId, {
      planTier,
      status: "active",
      billingInterval,
      currentPeriodStart: now,
      currentPeriodEnd,
      createdAt: now,
      canceledAt: null,
    });

    return {
      success: true,
      subscriptionId: subscription.id,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getActiveSubscription(): Promise<Subscription | null> {
  try {
    const { userId } = await getAuthenticatedUserId();
    const repo = new SubscriptionsRepository();
    return repo.getActiveSubscriptionForUser(userId);
  } catch (error) {
    console.error("Error getting active subscription:", error);
    return null;
  }
}

export async function cancelSubscription(accountId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await getAuthenticatedUserId();

    const accountRepo = new AccountsRepository(userId);
    const account = await accountRepo.get(accountId);
    if (!account) {
      return { success: false, error: "Account not found" };
    }

    const repo = new SubscriptionsRepository();
    await repo.cancel(accountId);

    return { success: true };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

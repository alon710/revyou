"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { SubscriptionsRepository } from "@/lib/db/repositories";
import type { Subscription } from "@/lib/db/schema";

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

export async function cancelSubscription(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await getAuthenticatedUserId();

    const repo = new SubscriptionsRepository();
    await repo.cancel(userId);

    return { success: true };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

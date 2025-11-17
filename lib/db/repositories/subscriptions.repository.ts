import { eq, and, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  subscriptions,
  userAccounts,
  accounts,
  reviews,
  type Subscription,
  type SubscriptionInsert,
} from "@/lib/db/schema";
import { type PlanLimits, getPlanLimits, type PlanTier } from "@/lib/subscriptions/plans";
import { startOfMonth } from "date-fns";

/**
 * Subscriptions repository using Drizzle ORM
 * Manages subscription and billing information
 * Note: Subscriptions are linked to users (1:1), not accounts
 */
export class SubscriptionsRepository {
  /**
   * Get active subscription for a user
   */
  async getActiveSubscriptionForUser(userId: string): Promise<Subscription | null> {
    try {
      const [result] = await db
        .select()
        .from(subscriptions)
        .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
        .limit(1);

      return result || null;
    } catch (error) {
      console.error("Error fetching active subscription for user:", error);
      return null;
    }
  }

  /**
   * Create or update subscription for a user
   */
  async upsert(userId: string, data: Omit<SubscriptionInsert, "userId">): Promise<Subscription> {
    const existing = await this.getActiveSubscriptionForUser(userId);

    if (existing) {
      // Update existing subscription
      const [updated] = await db
        .update(subscriptions)
        .set({
          planTier: data.planTier,
          status: data.status,
          billingInterval: data.billingInterval,
          currentPeriodStart: data.currentPeriodStart,
          currentPeriodEnd: data.currentPeriodEnd,
          canceledAt: data.canceledAt,
        })
        .where(eq(subscriptions.id, existing.id))
        .returning();

      if (!updated) throw new Error("Failed to update subscription");
      return updated;
    } else {
      // Create new subscription
      const [created] = await db
        .insert(subscriptions)
        .values({
          userId,
          ...data,
        })
        .returning();

      if (!created) throw new Error("Failed to create subscription");
      return created;
    }
  }

  /**
   * Cancel subscription for a user
   */
  async cancel(userId: string): Promise<Subscription> {
    const existing = await this.getActiveSubscriptionForUser(userId);

    if (!existing) {
      throw new Error("No active subscription found");
    }

    const [canceled] = await db
      .update(subscriptions)
      .set({
        status: "canceled",
        canceledAt: new Date(),
      })
      .where(eq(subscriptions.id, existing.id))
      .returning();

    if (!canceled) throw new Error("Failed to cancel subscription");
    return canceled;
  }

  /**
   * Get plan limits for a user (based on their best subscription)
   */
  async getUserPlanLimits(userId: string): Promise<PlanLimits> {
    try {
      const subscription = await this.getActiveSubscriptionForUser(userId);

      if (subscription) {
        return getPlanLimits(subscription.planTier as PlanTier);
      }

      // Default to free plan
      return getPlanLimits("free");
    } catch (error) {
      console.error("Error fetching user plan limits:", error);
      return getPlanLimits("free");
    }
  }

  /**
   * Count user's reviews this month (across all their accounts)
   */
  async countUserReviewsThisMonth(userId: string): Promise<number> {
    try {
      const startDate = startOfMonth(new Date());

      const result = await db
        .select({ count: reviews.id })
        .from(reviews)
        .innerJoin(accounts, eq(reviews.accountId, accounts.id))
        .innerJoin(userAccounts, eq(accounts.id, userAccounts.accountId))
        .where(and(eq(userAccounts.userId, userId), gte(reviews.receivedAt, startDate)));

      return result.length;
    } catch (error) {
      console.error("Error counting user reviews this month:", error);
      return 0;
    }
  }
}

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
 * Note: Subscriptions are now linked to accounts (1:1), not users
 */
export class SubscriptionsRepository {
  /**
   * Get active subscription for a specific account
   */
  async getActiveSubscriptionForAccount(accountId: string): Promise<Subscription | null> {
    try {
      const [result] = await db
        .select()
        .from(subscriptions)
        .where(and(eq(subscriptions.accountId, accountId), eq(subscriptions.status, "active")))
        .limit(1);

      return result || null;
    } catch (error) {
      console.error("Error fetching active subscription for account:", error);
      return null;
    }
  }

  /**
   * Get active subscription for a user (checks all accounts user has access to)
   * Returns the best subscription (highest tier) if user has multiple
   */
  async getActiveSubscriptionForUser(userId: string): Promise<Subscription | null> {
    try {
      const results = await db
        .select({ subscription: subscriptions })
        .from(subscriptions)
        .innerJoin(userAccounts, eq(subscriptions.accountId, userAccounts.accountId))
        .where(and(eq(userAccounts.userId, userId), eq(subscriptions.status, "active")));

      if (results.length === 0) {
        return null;
      }

      // Return the highest tier subscription
      const planTierOrder: Record<string, number> = { free: 0, basic: 1, pro: 2 };
      return results.reduce((best, current) => {
        const currentTier = planTierOrder[current.subscription.planTier] || 0;
        const bestTier = planTierOrder[best.planTier] || 0;
        return currentTier > bestTier ? current.subscription : best;
      }, results[0].subscription);
    } catch (error) {
      console.error("Error fetching active subscription for user:", error);
      return null;
    }
  }

  /**
   * Create or update subscription for an account
   */
  async upsert(accountId: string, data: Omit<SubscriptionInsert, "accountId">): Promise<Subscription> {
    const existing = await this.getActiveSubscriptionForAccount(accountId);

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
          accountId,
          ...data,
        })
        .returning();

      if (!created) throw new Error("Failed to create subscription");
      return created;
    }
  }

  /**
   * Cancel subscription for an account
   */
  async cancel(accountId: string): Promise<Subscription> {
    const existing = await this.getActiveSubscriptionForAccount(accountId);

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

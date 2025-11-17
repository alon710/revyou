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

export class SubscriptionsRepository {
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

  async upsert(userId: string, data: Omit<SubscriptionInsert, "userId">): Promise<Subscription> {
    const existing = await this.getActiveSubscriptionForUser(userId);

    if (existing) {
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

  async getUserPlanLimits(userId: string): Promise<PlanLimits> {
    try {
      const subscription = await this.getActiveSubscriptionForUser(userId);

      if (subscription) {
        return getPlanLimits(subscription.planTier as PlanTier);
      }

      return getPlanLimits("free");
    } catch (error) {
      console.error("Error fetching user plan limits:", error);
      return getPlanLimits("free");
    }
  }

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

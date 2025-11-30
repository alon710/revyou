import { eq, and, gte, countDistinct } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  subscriptions,
  userAccounts,
  accounts,
  businesses,
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

  async getByUserId(userId: string): Promise<Subscription | null> {
    try {
      const [result] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);

      return result || null;
    } catch (error) {
      console.error("Error fetching subscription by user ID:", error);
      return null;
    }
  }

  async create(data: SubscriptionInsert): Promise<Subscription> {
    try {
      const [created] = await db.insert(subscriptions).values(data).returning();

      if (!created) throw new Error("Failed to create subscription");
      return created;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Omit<Subscription, "id" | "userId" | "createdAt">>): Promise<Subscription> {
    try {
      const [updated] = await db.update(subscriptions).set(data).where(eq(subscriptions.id, id)).returning();

      if (!updated) throw new Error("Failed to update subscription");
      return updated;
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw error;
    }
  }

  async upsert(userId: string, data: Omit<SubscriptionInsert, "userId">): Promise<Subscription> {
    const existing = await this.getByUserId(userId);

    if (existing) {
      return this.update(existing.id, data);
    } else {
      return this.create({
        userId,
        ...data,
      });
    }
  }

  async cancel(userId: string): Promise<Subscription> {
    const existing = await this.getActiveSubscriptionForUser(userId);

    if (!existing) {
      throw new Error("No active subscription found");
    }

    return this.update(existing.id, {
      status: "canceled",
      planTier: "free",
    });
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
        .select({ count: countDistinct(reviews.id) })
        .from(reviews)
        .innerJoin(businesses, eq(reviews.businessId, businesses.id))
        .innerJoin(accounts, eq(businesses.accountId, accounts.id))
        .innerJoin(userAccounts, eq(accounts.id, userAccounts.accountId))
        .where(
          and(eq(userAccounts.userId, userId), gte(reviews.receivedAt, startDate), eq(reviews.consumesQuota, true))
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error("Error counting user reviews this month:", error);
      return 0;
    }
  }
}

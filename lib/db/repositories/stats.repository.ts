import { eq, and, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businesses, reviews, userAccounts } from "@/lib/db/schema";
import { startOfMonth } from "date-fns";

/**
 * Stats repository using Drizzle ORM
 * Provides statistical queries for user data
 */
export class StatsRepository {
  /**
   * Count total connected businesses for a user (across all their accounts)
   */
  async countUserBusinesses(userId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: businesses.id })
        .from(businesses)
        .innerJoin(userAccounts, eq(businesses.accountId, userAccounts.accountId))
        .where(and(eq(userAccounts.userId, userId), eq(businesses.connected, true)));

      return result.length;
    } catch (error) {
      console.error("Error counting user businesses:", error);
      return 0;
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
        .innerJoin(userAccounts, eq(reviews.accountId, userAccounts.accountId))
        .where(and(eq(userAccounts.userId, userId), gte(reviews.receivedAt, startDate)));

      return result.length;
    } catch (error) {
      console.error("Error counting user reviews this month:", error);
      return 0;
    }
  }
}

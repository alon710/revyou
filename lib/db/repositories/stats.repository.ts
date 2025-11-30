import { eq, and, gte, countDistinct } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businesses, reviews, userAccounts } from "@/lib/db/schema";
import { startOfMonth } from "date-fns";

export class StatsRepository {
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

  async countUserReviewsThisMonth(userId: string): Promise<number> {
    try {
      const startDate = startOfMonth(new Date());

      const result = await db
        .select({ count: countDistinct(reviews.id) })
        .from(reviews)
        .innerJoin(businesses, eq(reviews.businessId, businesses.id))
        .innerJoin(userAccounts, eq(businesses.accountId, userAccounts.accountId))
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

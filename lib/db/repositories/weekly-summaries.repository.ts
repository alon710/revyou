import { desc, eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { weeklySummaries, type WeeklySummary, type WeeklySummaryInsert } from "@/lib/db/schema";

export class WeeklySummariesRepository {
  async create(data: WeeklySummaryInsert): Promise<WeeklySummary> {
    const [summary] = await db.insert(weeklySummaries).values(data).returning();
    return summary;
  }

  async getLatestForBusiness(
    businessId: string,
    weekStartDate: string,
    weekEndDate: string
  ): Promise<WeeklySummary | undefined> {
    return await db.query.weeklySummaries.findFirst({
      where: and(
        eq(weeklySummaries.businessId, businessId),
        eq(weeklySummaries.weekStartDate, weekStartDate),
        eq(weeklySummaries.weekEndDate, weekEndDate)
      ),
      orderBy: [desc(weeklySummaries.createdAt)],
    });
  }

  async getByBusinessId(businessId: string, limit = 10): Promise<WeeklySummary[]> {
    return await db.query.weeklySummaries.findMany({
      where: eq(weeklySummaries.businessId, businessId),
      orderBy: [desc(weeklySummaries.weekStartDate)],
      limit,
    });
  }
}

import { pgTable, timestamp, uuid, integer, jsonb, pgPolicy, date, real, unique, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { businesses } from "./businesses.schema";
import { userAccounts } from "./user-accounts.schema";
import { authenticatedRole, authUid } from "./roles";

export const weeklySummaries = pgTable(
  "weekly_summaries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),

    weekStartDate: date("week_start_date").notNull(),
    weekEndDate: date("week_end_date").notNull(),

    totalReviews: integer("total_reviews").notNull(),
    averageRating: real("average_rating").notNull(),

    positiveThemes: jsonb("positive_themes").$type<string[]>().default([]),
    negativeThemes: jsonb("negative_themes").$type<string[]>().default([]),
    recommendations: jsonb("recommendations").$type<string[]>().default([]),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("weekly_summaries_business_week_unique").on(table.businessId, table.weekStartDate, table.weekEndDate),
    index("weekly_summaries_business_week_idx").on(table.businessId, table.weekStartDate, table.weekEndDate),
    pgPolicy("weekly_summaries_select_associated", {
      for: "select",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM ${businesses} b
        JOIN ${userAccounts} ua ON ua.account_id = b.account_id
        WHERE b.id = ${table.businessId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
  ]
);

export type WeeklySummary = typeof weeklySummaries.$inferSelect;
export type WeeklySummaryInsert = typeof weeklySummaries.$inferInsert;

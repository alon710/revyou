import { pgTable, timestamp, uuid, integer, jsonb, pgPolicy, date, real } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { businesses } from "./businesses.schema";
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
    pgPolicy("weekly_summaries_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM ${businesses} b
        WHERE b.id = ${table.businessId}
        AND b.owner_id = ${authUid()}
      )`,
    }),
  ]
);

export type WeeklySummary = typeof weeklySummaries.$inferSelect;
export type WeeklySummaryInsert = typeof weeklySummaries.$inferInsert;

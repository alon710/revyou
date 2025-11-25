import { pgTable, text, timestamp, uuid, index, check, pgPolicy, boolean } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { authenticatedRole, authUid } from "./roles";
import { businesses } from "./businesses.schema";
import { reviews } from "./reviews.schema";
import { accounts } from "./accounts.schema";
import { authUsers } from "./auth.schema";

export const reviewResponses = pgTable(
  "review_responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),

    text: text("text").notNull(),
    status: text("status").notNull(),
    isImported: boolean("is_imported").notNull().default(false),

    generatedBy: uuid("generated_by").references(() => authUsers.id, { onDelete: "set null" }),
    postedBy: uuid("posted_by").references(() => authUsers.id, { onDelete: "set null" }),
    postedAt: timestamp("posted_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("review_responses_business_id_idx").on(table.businessId),
    index("review_responses_review_id_idx").on(table.reviewId),
    index("review_responses_status_idx").on(table.status),
    index("review_responses_created_at_idx").on(table.createdAt),
    index("review_responses_business_status_created_idx").on(table.businessId, table.status, table.createdAt),

    check("review_responses_status_check", sql`${table.status} IN ('draft', 'posted', 'rejected')`),

    pgPolicy("review_responses_select_associated", {
      for: "select",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("review_responses_insert_associated", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
  ]
);

export const reviewResponsesRelations = relations(reviewResponses, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewResponses.reviewId],
    references: [reviews.id],
  }),
  business: one(businesses, {
    fields: [reviewResponses.businessId],
    references: [businesses.id],
  }),
  account: one(accounts, {
    fields: [reviewResponses.accountId],
    references: [accounts.id],
  }),
}));

export type ReviewResponse = typeof reviewResponses.$inferSelect;
export type ReviewResponseInsert = typeof reviewResponses.$inferInsert;

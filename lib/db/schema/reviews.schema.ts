import { boolean, integer, pgTable, text, timestamp, uuid, index, pgPolicy, check } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { authenticatedRole, authUid } from "./roles";
import { businesses } from "./businesses.schema";
import { accounts } from "./accounts.schema";
import { authUsers } from "./auth.schema";
import type { ReplyStatus } from "../../types/review.types";
import { reviewResponses } from "./review-responses.schema";

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),

    googleReviewId: text("google_review_id").notNull().unique(),
    googleReviewName: text("google_review_name"),

    name: text("name").notNull(),
    photoUrl: text("photo_url"),
    isAnonymous: boolean("is_anonymous").notNull().default(false),

    rating: integer("rating").notNull(),
    text: text("text"),
    date: timestamp("date", { withTimezone: true }).notNull(),

    replyStatus: text("reply_status").$type<ReplyStatus>().notNull().default("pending"),
    postedReply: text("posted_reply"),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    postedBy: uuid("posted_by").references(() => authUsers.id, { onDelete: "set null" }),

    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    updateTime: timestamp("update_time", { withTimezone: true }),
  },
  (table) => [
    index("reviews_account_id_idx").on(table.accountId),
    index("reviews_business_id_idx").on(table.businessId),
    index("reviews_google_review_id_idx").on(table.googleReviewId),
    index("reviews_reply_status_idx").on(table.replyStatus),
    index("reviews_received_at_idx").on(table.receivedAt),
    index("reviews_account_business_idx").on(table.accountId, table.businessId),
    index("reviews_business_status_idx").on(table.businessId, table.replyStatus),
    index("reviews_received_status_idx").on(table.receivedAt, table.replyStatus),

    check(
      "reviews_reply_status_check",
      sql`${table.replyStatus} IN ('pending', 'rejected', 'posted', 'failed', 'quota_exceeded')`
    ),

    pgPolicy("reviews_select_associated", {
      for: "select",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("reviews_insert_associated", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("reviews_update_associated", {
      for: "update",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("reviews_delete_owner", {
      for: "delete",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
        AND ua.role = 'owner'
      )`,
    }),
  ]
);

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  business: one(businesses, {
    fields: [reviews.businessId],
    references: [businesses.id],
  }),
  account: one(accounts, {
    fields: [reviews.accountId],
    references: [accounts.id],
  }),
  responses: many(reviewResponses),
}));

export type Review = typeof reviews.$inferSelect;
export type ReviewInsert = typeof reviews.$inferInsert;

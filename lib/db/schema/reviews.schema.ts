import { boolean, integer, pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticatedRole, authUid } from "./roles";
import { businesses } from "./businesses.schema";
import { accounts } from "./accounts.schema";

/**
 * Reviews table
 * Stores Google Business Profile reviews and AI-generated replies
 */
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

    // Google review details
    googleReviewId: text("google_review_id").notNull().unique(),
    googleReviewName: text("google_review_name"),

    // Reviewer information
    name: text("name").notNull(),
    photoUrl: text("photo_url"),
    isAnonymous: boolean("is_anonymous").notNull().default(false),

    // Review content
    rating: integer("rating").notNull(),
    text: text("text"),
    date: timestamp("date", { withTimezone: true }).notNull(),

    // AI reply
    aiReply: text("ai_reply"),
    aiReplyGeneratedAt: timestamp("ai_reply_generated_at", { withTimezone: true }),

    // Posted reply
    replyStatus: text("reply_status").notNull().default("pending"), // pending, rejected, posted, failed, quota_exceeded
    postedReply: text("posted_reply"),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    postedBy: uuid("posted_by"), // References auth.users

    // Timestamps
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    updateTime: timestamp("update_time", { withTimezone: true }),
  },
  (table) => [
    // Indexes
    index("reviews_account_id_idx").on(table.accountId),
    index("reviews_business_id_idx").on(table.businessId),
    index("reviews_google_review_id_idx").on(table.googleReviewId),
    index("reviews_reply_status_idx").on(table.replyStatus),
    index("reviews_received_at_idx").on(table.receivedAt),
    index("reviews_account_business_idx").on(table.accountId, table.businessId),
    index("reviews_business_status_idx").on(table.businessId, table.replyStatus),
    index("reviews_received_status_idx").on(table.receivedAt, table.replyStatus),

    // RLS Policies: Users can access reviews for accounts they have access to
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

export type Review = typeof reviews.$inferSelect;
export type ReviewInsert = typeof reviews.$inferInsert;

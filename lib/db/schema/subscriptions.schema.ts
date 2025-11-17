import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";

/**
 * Subscriptions table
 * Stores subscription and billing information
 * 1:1 relationship with users (stored in Supabase Auth)
 */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique(),

    // Plan details
    planTier: text("plan_tier").notNull().default("free"), // free, basic, pro
    status: text("status").notNull().default("active"), // active, canceled, expired
    billingInterval: text("billing_interval"), // monthly, yearly

    // Billing period
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
    statusIdx: index("subscriptions_status_idx").on(table.status),
    userStatusIdx: index("subscriptions_user_status_idx").on(table.userId, table.status),
  })
);

export type Subscription = typeof subscriptions.$inferSelect;
export type SubscriptionInsert = typeof subscriptions.$inferInsert;

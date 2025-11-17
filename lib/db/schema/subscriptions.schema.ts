import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { accounts } from "./accounts.schema";

/**
 * Subscriptions table
 * Stores subscription and billing information
 * 1:1 relationship with accounts
 */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .unique()
      .references(() => accounts.id, { onDelete: "cascade" }),

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
    accountIdIdx: index("subscriptions_account_id_idx").on(table.accountId),
    statusIdx: index("subscriptions_status_idx").on(table.status),
    accountStatusIdx: index("subscriptions_account_status_idx").on(table.accountId, table.status),
  })
);

export type Subscription = typeof subscriptions.$inferSelect;
export type SubscriptionInsert = typeof subscriptions.$inferInsert;

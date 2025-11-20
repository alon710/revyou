import { pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticatedRole, authUid } from "./roles";
import { authUsers } from "./auth.schema";

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => authUsers.id, { onDelete: "cascade" }),

    planTier: text("plan_tier").notNull().default("free"),
    status: text("status").notNull().default("active"),

    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripePriceId: text("stripe_price_id"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("subscriptions_user_id_idx").on(table.userId),
    index("subscriptions_status_idx").on(table.status),
    index("subscriptions_user_status_idx").on(table.userId, table.status),

    pgPolicy("subscriptions_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${authUid()} = ${table.userId}`,
    }),
    pgPolicy("subscriptions_insert_own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${authUid()} = ${table.userId}`,
    }),
    pgPolicy("subscriptions_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`${authUid()} = ${table.userId}`,
    }),
    pgPolicy("subscriptions_delete_own", {
      for: "delete",
      to: authenticatedRole,
      using: sql`${authUid()} = ${table.userId}`,
    }),
  ]
);

export type Subscription = typeof subscriptions.$inferSelect;
export type SubscriptionInsert = typeof subscriptions.$inferInsert;

import { boolean, pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticatedRole, authUid } from "./roles";
import { accounts } from "./accounts.schema";

/**
 * Businesses table
 * Stores Google Business Profile locations
 */
export const businesses = pgTable(
  "businesses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),

    // Google Business Profile details
    googleBusinessId: text("google_business_id").notNull().unique(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    phoneNumber: text("phone_number"),
    websiteUrl: text("website_url"),
    mapsUrl: text("maps_url"),
    description: text("description"),
    photoUrl: text("photo_url"),

    // Status
    connected: boolean("connected").notNull().default(true),

    // Timestamps
    connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Indexes
    index("businesses_account_id_idx").on(table.accountId),
    index("businesses_google_business_id_idx").on(table.googleBusinessId),
    index("businesses_connected_idx").on(table.connected),
    index("businesses_account_connected_idx").on(table.accountId, table.connected),

    // RLS Policies: Users can access businesses in accounts they have access to
    pgPolicy("businesses_select_associated", {
      for: "select",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("businesses_insert_associated", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("businesses_update_associated", {
      for: "update",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("businesses_delete_owner", {
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

export type Business = typeof businesses.$inferSelect;
export type BusinessInsert = typeof businesses.$inferInsert;

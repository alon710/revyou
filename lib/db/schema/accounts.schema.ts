import { pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticatedRole, authUid } from "./roles";

/**
 * Accounts table
 * Stores Google Business Profile accounts
 */
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Account details
    email: text("email").notNull(),
    accountName: text("account_name").notNull(),
    googleAccountName: text("google_account_name"),

    // OAuth tokens (encrypted)
    googleRefreshToken: text("google_refresh_token").notNull(),

    // Timestamps
    connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
    lastSynced: timestamp("last_synced", { withTimezone: true }),
  },
  (table) => [
    // Indexes
    index("accounts_email_idx").on(table.email),
    index("accounts_connected_at_idx").on(table.connectedAt),

    // RLS Policies: Users can view accounts they have access to via user_accounts
    pgPolicy("accounts_select_associated", {
      for: "select",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.id}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("accounts_insert_authenticated", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`true`, // All authenticated users can create accounts (ownership via user_accounts)
    }),
    pgPolicy("accounts_update_owner", {
      for: "update",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.id}
        AND ua.user_id = ${authUid()}
        AND ua.role = 'owner'
      )`,
    }),
    pgPolicy("accounts_delete_owner", {
      for: "delete",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.id}
        AND ua.user_id = ${authUid()}
        AND ua.role = 'owner'
      )`,
    }),
  ]
);

export type Account = typeof accounts.$inferSelect;
export type AccountInsert = typeof accounts.$inferInsert;

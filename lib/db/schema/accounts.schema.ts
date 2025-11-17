import { pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticatedRole, authUid } from "./roles";

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    email: text("email").notNull(),
    accountName: text("account_name").notNull(),
    googleAccountName: text("google_account_name"),

    googleRefreshToken: text("google_refresh_token").notNull(),

    connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
    lastSynced: timestamp("last_synced", { withTimezone: true }),
  },
  (table) => [
    index("accounts_email_idx").on(table.email),
    index("accounts_connected_at_idx").on(table.connectedAt),

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
      withCheck: sql`true`,
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

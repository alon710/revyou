import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";

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
  (table) => ({
    emailIdx: index("accounts_email_idx").on(table.email),
    connectedAtIdx: index("accounts_connected_at_idx").on(table.connectedAt),
  })
);

export type Account = typeof accounts.$inferSelect;
export type AccountInsert = typeof accounts.$inferInsert;

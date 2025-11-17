import { pgTable, primaryKey, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { accounts } from "./accounts.schema";

/**
 * User-Accounts junction table
 * Enables many-to-many relationship between users and accounts
 * Allows multiple users to share access to accounts and businesses
 */
export const userAccounts = pgTable(
  "user_accounts",
  {
    userId: uuid("user_id").notNull(), // References auth.users in Supabase
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),

    // Access metadata
    role: text("role").notNull().default("owner"), // owner, admin, member, etc.
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.accountId] }),
    userIdIdx: index("user_accounts_user_id_idx").on(table.userId),
    accountIdIdx: index("user_accounts_account_id_idx").on(table.accountId),
  })
);

export type UserAccount = typeof userAccounts.$inferSelect;
export type UserAccountInsert = typeof userAccounts.$inferInsert;

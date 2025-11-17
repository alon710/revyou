import { pgTable, primaryKey, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticatedRole, authUid } from "./roles";
import { accounts } from "./accounts.schema";

export const userAccounts = pgTable(
  "user_accounts",
  {
    userId: uuid("user_id").notNull(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),

    role: text("role").notNull().default("owner"),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.accountId] }),
    index("user_accounts_user_id_idx").on(table.userId),
    index("user_accounts_account_id_idx").on(table.accountId),

    pgPolicy("user_accounts_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${authUid()} = ${table.userId}`,
    }),
    pgPolicy("user_accounts_insert_owner", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
        AND ua.role = 'owner'
      )`,
    }),
    pgPolicy("user_accounts_update_owner", {
      for: "update",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
        AND ua.role = 'owner'
      )`,
    }),
    pgPolicy("user_accounts_delete_owner", {
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

export type UserAccount = typeof userAccounts.$inferSelect;
export type UserAccountInsert = typeof userAccounts.$inferInsert;

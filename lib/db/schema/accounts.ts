import { pgTable, uuid, text, timestamp, pgPolicy } from 'drizzle-orm/pg-core';
import { authenticatedRole } from 'drizzle-orm/supabase';
import { relations, sql } from 'drizzle-orm';

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  accountName: text('account_name').notNull(),
  googleRefreshToken: text('google_refresh_token'),
  googleAccountName: text('google_account_name'),
  paddleCustomerId: text('paddle_customer_id'),
  subscriptionId: text('subscription_id'),
  subscriptionStatus: text('subscription_status').$type<'active' | 'canceled' | 'past_due' | 'trialing'>(),
  planTier: text('plan_tier').$type<'free' | 'starter' | 'pro'>().default('free'),
  connectedAt: timestamp('connected_at').defaultNow().notNull(),
  lastSynced: timestamp('last_synced'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  pgPolicy('users_view_their_accounts', {
    for: 'select',
    to: authenticatedRole,
    using: sql`${table.id} IN (
      SELECT account_id FROM user_accounts WHERE user_id = auth.uid()
    )`,
  }),
  pgPolicy('owners_update_accounts', {
    for: 'update',
    to: authenticatedRole,
    using: sql`${table.id} IN (
      SELECT account_id FROM user_accounts
      WHERE user_id = auth.uid() AND role = 'owner'
    )`,
  }),
  pgPolicy('authenticated_create_accounts', {
    for: 'insert',
    to: authenticatedRole,
    withCheck: sql`auth.uid() IS NOT NULL`,
  }),
]).enableRLS();

export const userAccounts = pgTable('user_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  role: text('role').$type<'owner' | 'member'>().notNull().default('member'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => [
  pgPolicy('users_view_memberships', {
    for: 'select',
    to: authenticatedRole,
    using: sql`${table.userId} = auth.uid()`,
  }),
  pgPolicy('owners_manage_memberships', {
    for: 'all',
    to: authenticatedRole,
    using: sql`${table.accountId} IN (
      SELECT account_id FROM user_accounts
      WHERE user_id = auth.uid() AND role = 'owner'
    )`,
  }),
]).enableRLS();

export const accountsRelations = relations(accounts, ({ many }) => ({
  userAccounts: many(userAccounts),
}));

export const userAccountsRelations = relations(userAccounts, ({ one }) => ({
  account: one(accounts, {
    fields: [userAccounts.accountId],
    references: [accounts.id],
  }),
}));

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type UserAccount = typeof userAccounts.$inferSelect;
export type NewUserAccount = typeof userAccounts.$inferInsert;

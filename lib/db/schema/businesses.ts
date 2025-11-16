import { pgTable, uuid, text, timestamp, boolean, jsonb, pgPolicy } from 'drizzle-orm/pg-core';
import { authenticatedRole } from 'drizzle-orm/supabase';
import { relations, sql } from 'drizzle-orm';
import { accounts } from './accounts';

export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  googleBusinessId: text('google_business_id').notNull().unique(),
  name: text('name').notNull(),
  address: text('address'),
  phoneNumber: text('phone_number'),
  websiteUrl: text('website_url'),
  mapsUrl: text('maps_url'),
  description: text('description'),
  photoUrl: text('photo_url'),
  emailOnNewReview: boolean('email_on_new_review').default(false).notNull(),
  connected: boolean('connected').default(true).notNull(),
  connectedAt: timestamp('connected_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  pgPolicy('users_view_account_businesses', {
    for: 'select',
    to: authenticatedRole,
    using: sql`${table.accountId} IN (
      SELECT account_id FROM user_accounts WHERE user_id = auth.uid()
    )`,
  }),
  pgPolicy('owners_manage_businesses', {
    for: 'all',
    to: authenticatedRole,
    using: sql`${table.accountId} IN (
      SELECT account_id FROM user_accounts
      WHERE user_id = auth.uid() AND role = 'owner'
    )`,
  }),
]).enableRLS();

export const businessConfigs = pgTable('business_configs', {
  businessId: uuid('business_id').primaryKey().references(() => businesses.id, { onDelete: 'cascade' }),
  config: jsonb('config').notNull().default({}),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  pgPolicy('users_view_business_configs', {
    for: 'select',
    to: authenticatedRole,
    using: sql`${table.businessId} IN (
      SELECT b.id FROM businesses b
      INNER JOIN user_accounts ua ON b.account_id = ua.account_id
      WHERE ua.user_id = auth.uid()
    )`,
  }),
  pgPolicy('owners_manage_business_configs', {
    for: 'all',
    to: authenticatedRole,
    using: sql`${table.businessId} IN (
      SELECT b.id FROM businesses b
      INNER JOIN user_accounts ua ON b.account_id = ua.account_id
      WHERE ua.user_id = auth.uid() AND ua.role = 'owner'
    )`,
  }),
]).enableRLS();

export const businessesRelations = relations(businesses, ({ one }) => ({
  account: one(accounts, {
    fields: [businesses.accountId],
    references: [accounts.id],
  }),
  config: one(businessConfigs, {
    fields: [businesses.id],
    references: [businessConfigs.businessId],
  }),
}));

export const businessConfigsRelations = relations(businessConfigs, ({ one }) => ({
  business: one(businesses, {
    fields: [businessConfigs.businessId],
    references: [businesses.id],
  }),
}));

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
export type BusinessConfig = typeof businessConfigs.$inferSelect;
export type NewBusinessConfig = typeof businessConfigs.$inferInsert;

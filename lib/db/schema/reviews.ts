import { pgTable, uuid, text, timestamp, integer, boolean, pgPolicy } from 'drizzle-orm/pg-core';
import { authenticatedRole } from 'drizzle-orm/supabase';
import { relations, sql } from 'drizzle-orm';
import { businesses } from './businesses';
import { accounts } from './accounts';

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  googleReviewId: text('google_review_id').notNull().unique(),
  googleReviewName: text('google_review_name'),
  reviewerName: text('reviewer_name').notNull(),
  reviewerPhotoUrl: text('reviewer_photo_url'),
  isAnonymous: boolean('is_anonymous').default(false),
  rating: integer('rating').notNull(),
  text: text('text'),
  reviewDate: timestamp('review_date').notNull(),
  updateTime: timestamp('update_time'),
  replyStatus: text('reply_status').$type<'pending' | 'generated' | 'posted' | 'skipped'>().default('pending').notNull(),
  aiReply: text('ai_reply'),
  aiReplyGeneratedAt: timestamp('ai_reply_generated_at'),
  postedReply: text('posted_reply'),
  postedAt: timestamp('posted_at'),
  postedBy: uuid('posted_by'),
  receivedAt: timestamp('received_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  pgPolicy('users_view_account_reviews', {
    for: 'select',
    to: authenticatedRole,
    using: sql`${table.accountId} IN (
      SELECT account_id FROM user_accounts WHERE user_id = auth.uid()
    )`,
  }),
  pgPolicy('owners_manage_reviews', {
    for: 'all',
    to: authenticatedRole,
    using: sql`${table.accountId} IN (
      SELECT account_id FROM user_accounts
      WHERE user_id = auth.uid() AND role = 'owner'
    )`,
  }),
]).enableRLS();

export const reviewsRelations = relations(reviews, ({ one }) => ({
  business: one(businesses, {
    fields: [reviews.businessId],
    references: [businesses.id],
  }),
  account: one(accounts, {
    fields: [reviews.accountId],
    references: [accounts.id],
  }),
}));

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

import { boolean, integer, jsonb, pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticatedRole, authUid } from "./roles";
import { businesses } from "./businesses.schema";

/**
 * Business configurations table
 * Stores AI settings and preferences for each business
 * 1:1 relationship with businesses
 */
export const businessConfigs = pgTable(
  "business_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .unique()
      .references(() => businesses.id, { onDelete: "cascade" }),

    // Basic settings
    name: text("name").notNull(),
    description: text("description"),
    phoneNumber: text("phone_number"),

    // AI configuration
    toneOfVoice: text("tone_of_voice").notNull().default("friendly"), // friendly, formal, humorous, professional
    useEmojis: boolean("use_emojis").notNull().default(true),
    languageMode: text("language_mode").notNull().default("auto-detect"), // hebrew, english, auto-detect
    languageInstructions: text("language_instructions"),
    maxSentences: integer("max_sentences"),
    allowedEmojis: jsonb("allowed_emojis").$type<string[]>(),
    signature: text("signature"),

    // Star-specific configurations (JSONB for flexibility)
    starConfigs: jsonb("star_configs")
      .$type<{
        1: { customInstructions: string; autoReply: boolean };
        2: { customInstructions: string; autoReply: boolean };
        3: { customInstructions: string; autoReply: boolean };
        4: { customInstructions: string; autoReply: boolean };
        5: { customInstructions: string; autoReply: boolean };
      }>()
      .notNull(),

    // Email preferences
    emailOnNewReview: boolean("email_on_new_review").notNull().default(false),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    // Indexes
    index("business_configs_business_id_idx").on(table.businessId),

    // RLS Policies: Users can access configs for businesses they have access to
    pgPolicy("business_configs_select_associated", {
      for: "select",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM businesses b
        JOIN user_accounts ua ON ua.account_id = b.account_id
        WHERE b.id = ${table.businessId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("business_configs_insert_associated", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`EXISTS (
        SELECT 1 FROM businesses b
        JOIN user_accounts ua ON ua.account_id = b.account_id
        WHERE b.id = ${table.businessId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("business_configs_update_associated", {
      for: "update",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM businesses b
        JOIN user_accounts ua ON ua.account_id = b.account_id
        WHERE b.id = ${table.businessId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("business_configs_delete_associated", {
      for: "delete",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM businesses b
        JOIN user_accounts ua ON ua.account_id = b.account_id
        WHERE b.id = ${table.businessId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
  ]
);

export type BusinessConfig = typeof businessConfigs.$inferSelect;
export type BusinessConfigInsert = typeof businessConfigs.$inferInsert;

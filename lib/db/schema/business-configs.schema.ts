import { boolean, integer, jsonb, pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { authenticatedRole, authUid } from "./roles";
import { businesses } from "./businesses.schema";

export const businessConfigs = pgTable(
  "business_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .unique()
      .references(() => businesses.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    description: text("description"),
    phoneNumber: text("phone_number"),

    toneOfVoice: text("tone_of_voice").notNull().default("friendly"),
    useEmojis: boolean("use_emojis").notNull().default(true),
    languageMode: text("language_mode").notNull().default("auto-detect"),
    languageInstructions: text("language_instructions"),
    maxSentences: integer("max_sentences"),
    allowedEmojis: jsonb("allowed_emojis").$type<string[]>(),
    signature: text("signature"),

    starConfigs: jsonb("star_configs")
      .$type<{
        1: { customInstructions: string; autoReply: boolean };
        2: { customInstructions: string; autoReply: boolean };
        3: { customInstructions: string; autoReply: boolean };
        4: { customInstructions: string; autoReply: boolean };
        5: { customInstructions: string; autoReply: boolean };
      }>()
      .notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("business_configs_business_id_idx").on(table.businessId),

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

export const businessConfigsRelations = relations(businessConfigs, ({ one }) => ({
  business: one(businesses, {
    fields: [businessConfigs.businessId],
    references: [businesses.id],
  }),
}));

export type BusinessConfig = typeof businessConfigs.$inferSelect;
export type BusinessConfigInsert = typeof businessConfigs.$inferInsert;

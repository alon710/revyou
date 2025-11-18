import { boolean, integer, jsonb, pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { authenticatedRole, authUid } from "./roles";
import { accounts } from "./accounts.schema";
import { reviews } from "./reviews.schema";

export const businesses = pgTable(
  "businesses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),

    googleBusinessId: text("google_business_id").notNull().unique(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    phoneNumber: text("phone_number"),
    websiteUrl: text("website_url"),
    mapsUrl: text("maps_url"),
    description: text("description"),
    photoUrl: text("photo_url"),

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

    connected: boolean("connected").notNull().default(true),

    connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("businesses_account_id_idx").on(table.accountId),
    index("businesses_google_business_id_idx").on(table.googleBusinessId),
    index("businesses_connected_idx").on(table.connected),
    index("businesses_account_connected_idx").on(table.accountId, table.connected),

    pgPolicy("businesses_select_associated", {
      for: "select",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("businesses_insert_associated", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("businesses_update_associated", {
      for: "update",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("businesses_delete_owner", {
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

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  account: one(accounts, {
    fields: [businesses.accountId],
    references: [accounts.id],
  }),
  reviews: many(reviews),
}));

export type Business = typeof businesses.$inferSelect;
export type BusinessInsert = typeof businesses.$inferInsert;

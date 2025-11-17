import { boolean, pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { accounts } from "./accounts.schema";

/**
 * Businesses table
 * Stores Google Business Profile locations
 */
export const businesses = pgTable(
  "businesses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),

    // Google Business Profile details
    googleBusinessId: text("google_business_id").notNull().unique(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    phoneNumber: text("phone_number"),
    websiteUrl: text("website_url"),
    mapsUrl: text("maps_url"),
    description: text("description"),
    photoUrl: text("photo_url"),

    // Status
    connected: boolean("connected").notNull().default(true),

    // Timestamps
    connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    accountIdIdx: index("businesses_account_id_idx").on(table.accountId),
    googleBusinessIdIdx: index("businesses_google_business_id_idx").on(table.googleBusinessId),
    connectedIdx: index("businesses_connected_idx").on(table.connected),
    accountConnectedIdx: index("businesses_account_connected_idx").on(table.accountId, table.connected),
  })
);

export type Business = typeof businesses.$inferSelect;
export type BusinessInsert = typeof businesses.$inferInsert;

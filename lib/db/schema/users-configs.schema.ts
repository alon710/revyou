import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";

/**
 * Users configurations table
 * Stores user preferences and settings
 * References auth.users (Supabase Auth)
 */
export const usersConfigs = pgTable(
  "users_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // References auth.users in Supabase (managed externally, no FK constraint)
    userId: uuid("user_id").notNull().unique(),

    // Email preferences
    emailOnNewReview: text("email_on_new_review").notNull().default("true"),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index("users_configs_user_id_idx").on(table.userId),
  })
);

export type UsersConfig = typeof usersConfigs.$inferSelect;
export type UsersConfigInsert = typeof usersConfigs.$inferInsert;

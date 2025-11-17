import { pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticatedRole, authUid } from "./roles";

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
  (table) => [
    // Indexes
    index("users_configs_user_id_idx").on(table.userId),

    // RLS Policies: Users can only access their own config
    pgPolicy("users_configs_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${authUid()} = ${table.userId}`,
    }),
    pgPolicy("users_configs_insert_own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${authUid()} = ${table.userId}`,
    }),
    pgPolicy("users_configs_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`${authUid()} = ${table.userId}`,
    }),
    pgPolicy("users_configs_delete_own", {
      for: "delete",
      to: authenticatedRole,
      using: sql`${authUid()} = ${table.userId}`,
    }),
  ]
);

export type UsersConfig = typeof usersConfigs.$inferSelect;
export type UsersConfigInsert = typeof usersConfigs.$inferInsert;

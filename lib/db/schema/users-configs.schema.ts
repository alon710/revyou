import { pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticatedRole, authUid } from "./roles";

export const usersConfigs = pgTable(
  "users_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().unique(),

    emailOnNewReview: text("email_on_new_review").notNull().default("true"),

    locale: text("locale").notNull().default("en"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("users_configs_user_id_idx").on(table.userId),

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

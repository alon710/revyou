import { pgTable, timestamp, uuid, index, pgPolicy, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticatedRole, authUid } from "./roles";
import { authUsers } from "./auth.schema";

export const USER_CONFIG_KEYS = {
  EMAIL_ON_NEW_REVIEW: "EMAIL_ON_NEW_REVIEW",
  LOCALE: "LOCALE",
} as const;

export type UserConfigKey = keyof typeof USER_CONFIG_KEYS;

export type UserConfigMap = {
  EMAIL_ON_NEW_REVIEW: boolean;
  LOCALE: "en" | "he";
};

export type UserConfigValue<K extends UserConfigKey> = UserConfigMap[K];

export const usersConfigs = pgTable(
  "users_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => authUsers.id, { onDelete: "cascade" }),

    configs: jsonb("configs")
      .$type<UserConfigMap>()
      .notNull()
      .default(sql`'{}'::jsonb`),

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

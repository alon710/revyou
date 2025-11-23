import { pgSchema, uuid, timestamp, varchar } from "drizzle-orm/pg-core";

export const authSchema = pgSchema("auth");

export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }),
});

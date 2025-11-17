import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres client
const client = postgres(process.env.DATABASE_URL);

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Export schema for use in repositories
export { schema };

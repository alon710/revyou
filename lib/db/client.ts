import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (!dbInstance) {
    const poolMaxRaw = process.env.DB_POOL_MAX;
    const poolMax = poolMaxRaw ? parseInt(poolMaxRaw, 10) : 10;

    if (isNaN(poolMax) || poolMax <= 0) {
      throw new Error(`DB_POOL_MAX must be a positive integer, got: ${poolMaxRaw}`);
    }

    client = postgres(process.env.DATABASE_URL!, {
      max: poolMax,
      idle_timeout: 20,
      connect_timeout: 10,
      max_lifetime: 60 * 30,
    });
    dbInstance = drizzle(client, { schema });
  }

  return dbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle<typeof schema>>];
  },
});

export async function closeDb(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
    dbInstance = null;
  }
}

export { schema };

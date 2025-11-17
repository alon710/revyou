/**
 * Database reset and migration script
 * CAUTION: This will drop all existing tables and data!
 * Then applies Drizzle migrations and RLS policies to Supabase
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { readFile } from "fs/promises";
import { join } from "path";

async function resetAndMigrate() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("⚠️  WARNING: This will DROP all existing tables and data!");
  console.log("🔄 Connecting to database...");

  // Create connection for migrations
  const migrationClient = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    console.log("🗑️  Dropping existing tables...");

    // Drop tables in reverse order of dependencies
    await migrationClient.unsafe(`
      DROP TABLE IF EXISTS reviews CASCADE;
      DROP TABLE IF EXISTS business_configs CASCADE;
      DROP TABLE IF EXISTS businesses CASCADE;
      DROP TABLE IF EXISTS subscriptions CASCADE;
      DROP TABLE IF EXISTS user_accounts CASCADE;
      DROP TABLE IF EXISTS accounts CASCADE;
      DROP TABLE IF EXISTS users_configs CASCADE;
      DROP TABLE IF EXISTS drizzle.__drizzle_migrations CASCADE;
    `);

    console.log("✅ Existing tables dropped");

    console.log("🚀 Running Drizzle migrations...");
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
    console.log("✅ Drizzle migrations completed");

    console.log("🔒 Applying RLS policies...");
    const rlsSQL = await readFile(join(process.cwd(), "drizzle/rls-policies.sql"), "utf-8");

    // Execute RLS policies
    await migrationClient.unsafe(rlsSQL);
    console.log("✅ RLS policies applied");

    console.log("🎉 All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

resetAndMigrate();

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Database Trigger Setup");
  console.log("===================\n");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!process.env.INTERNAL_API_SECRET) {
    throw new Error("INTERNAL_API_SECRET environment variable is not set");
  }

  const client = postgres(process.env.DATABASE_URL, {
    max: 1,
  });

  const db = drizzle(client);

  try {
    console.log("Creating extensions schema...");
    await db.execute(sql`CREATE SCHEMA IF NOT EXISTS extensions;`);
    console.log("✓ extensions schema created");

    console.log("\nCreating pg_net extension in extensions schema...");
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;`);
    console.log("✓ pg_net extension created");

    console.log("\nCreating trigger_process_review function...");
    await db.execute(
      sql.raw(`
        CREATE OR REPLACE FUNCTION trigger_process_review()
        RETURNS TRIGGER
        SET search_path = public, extensions, pg_temp
        AS $$
        DECLARE
          v_user_id uuid;
        BEGIN
          -- Get the userId from the user_accounts junction table
          SELECT user_id INTO v_user_id
          FROM user_accounts
          WHERE account_id = NEW.account_id
          LIMIT 1;

          -- If no user found, log and return (don't fail the insert)
          IF v_user_id IS NULL THEN
            RAISE WARNING 'No user found for account_id: %', NEW.account_id;
            RETURN NEW;
          END IF;

          -- Make async HTTP POST request to process-review endpoint
          PERFORM extensions.net.http_post(
            url := 'https://bottie.ai/api/internal/process-review',
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'X-Internal-Secret', '${process.env.INTERNAL_API_SECRET}'
            ),
            body := jsonb_build_object(
              'userId', v_user_id::text,
              'accountId', NEW.account_id::text,
              'businessId', NEW.business_id::text,
              'reviewId', NEW.id::text
            )
          );

          -- Log successful trigger
          RAISE LOG 'Triggered review processing for review_id: %, user_id: %', NEW.id, v_user_id;

          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `)
    );
    console.log("✓ trigger_process_review function created");

    console.log("\nDropping existing trigger if it exists...");
    await db.execute(sql`DROP TRIGGER IF EXISTS on_review_insert ON reviews;`);
    console.log("✓ Existing trigger dropped (if any)");

    console.log("\nCreating on_review_insert trigger...");
    await db.execute(sql`
      CREATE TRIGGER on_review_insert
        AFTER INSERT ON reviews
        FOR EACH ROW
        EXECUTE FUNCTION trigger_process_review();
    `);
    console.log("✓ on_review_insert trigger created");

    console.log("\n===================");
    console.log("✓ Successfully set up database trigger");
    console.log("\nNew reviews will automatically trigger processing at:");
    console.log("https://bottie.ai/api/internal/process-review");
    console.log("\nThe internal API secret has been embedded in the trigger function.");
  } catch (error) {
    console.error("\n✗ Error setting up trigger:", error);
    throw error;
  } finally {
    await client.end();
  }

  console.log("\n===================");
  console.log("✓ Done!");
}

main().catch(console.error);

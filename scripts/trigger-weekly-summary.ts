import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

async function main() {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.error("❌ CRON_SECRET is missing in .env");
      process.exit(1);
    }

    const url = "http://localhost:3000/api/cron/weekly-summaries";
    console.log(`🚀 Triggering weekly summary cron job at ${url}...`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Cron job executed successfully!");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      console.error(`❌ Cron job failed: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error("Response body:", text);
    }
  } catch (error) {
    console.error("❌ Error executing script:", error);
    console.log("Make sure the Next.js server is running on port 3000!");
  }
}

main();

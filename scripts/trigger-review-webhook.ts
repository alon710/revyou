import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

import { select, checkbox } from "@inquirer/prompts";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";

import * as schema from "../lib/db/schema";
import { decryptToken } from "../lib/google/business-profile";
import { listReviews } from "../lib/google/reviews";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing in .env");
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema });

async function main() {
  try {
    console.log("🔍 Finding accounts...");
    const accounts = await db.query.accounts.findMany({
      columns: { id: true, email: true, accountName: true },
    });

    if (accounts.length === 0) {
      console.log("No accounts found in DB.");
      return;
    }

    const selectedAccountId = await select({
      message: "Select an account:",
      choices: accounts.map((a) => ({
        name: `${a.email} (${a.accountName})`,
        value: a.id,
      })),
    });

    console.log("🔍 Finding businesses...");
    const businesses = await db.query.businesses.findMany({
      where: eq(schema.businesses.accountId, selectedAccountId),
      columns: { id: true, name: true, googleBusinessId: true, connected: true },
    });

    if (businesses.length === 0) {
      console.log("No businesses found for this account.");
      return;
    }

    const selectedBusiness = await select({
      message: "Select a business:",
      choices: businesses.map((b) => ({
        name: `${b.name} (${b.googleBusinessId}) ${b.connected ? "✅" : "❌"}`,
        value: b,
      })),
    });

    if (!selectedBusiness.connected) {
      console.warn("⚠️ This business is marked as not connected. Fetching reviews might fail.");
    }

    const account = await db.query.accounts.findFirst({
      where: eq(schema.accounts.id, selectedAccountId),
      columns: { googleRefreshToken: true },
    });

    if (!account?.googleRefreshToken) {
      console.error("❌ No refresh token found for this account.");
      return;
    }

    const refreshToken = await decryptToken(account.googleRefreshToken, process.env.TOKEN_ENCRYPTION_SECRET);

    console.log(`🔄 Fetching reviews for ${selectedBusiness.name}...`);
    let reviewsResponse;
    try {
      reviewsResponse = await listReviews(
        selectedBusiness.googleBusinessId,
        refreshToken,
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
    } catch (error) {
      console.error("❌ Failed to fetch reviews:", error);
      return;
    }

    if (!reviewsResponse.reviews || reviewsResponse.reviews.length === 0) {
      console.log("No reviews found.");
      return;
    }

    const selectedReviews = await checkbox({
      message: "Select reviews to trigger webhook for:",
      choices: reviewsResponse.reviews.map((r) => ({
        name: `${r.starRating} stars - ${r.reviewer.displayName} - ${r.createTime ? new Date(r.createTime).toLocaleDateString() : "No date"} (${r.comment ? r.comment.substring(0, 30) + "..." : "No comment"})`,
        value: r,
      })),
    });

    if (selectedReviews.length === 0) {
      console.log("No reviews selected.");
      return;
    }

    for (const review of selectedReviews) {
      console.log(`🚀 Triggering webhook for review: ${review.reviewId}`);

      const notification = {
        type: "NEW_REVIEW",
        review: review.name,
        location: selectedBusiness.googleBusinessId,
      };

      const messageData = Buffer.from(JSON.stringify(notification)).toString("base64");

      const payload = {
        message: {
          data: messageData,
          messageId: `sim-${Date.now()}`,
          publishTime: new Date().toISOString(),
        },
        subscription: "projects/local/subscriptions/test-sub",
      };

      try {
        const webhookUrl = "http://localhost:3000/api/webhooks/google-reviews";
        console.log(`POST ${webhookUrl}`);
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Webhook triggered successfully! Response:`, data);
        } else {
          console.error(`❌ Webhook failed: ${response.status} ${response.statusText}`);
          const text = await response.text();
          console.error(text);
        }
      } catch (err) {
        console.error("❌ Error sending webhook request:", err);
        console.log("Make sure the Next.js server is running on port 3000!");
      }
    }
  } catch (error) {
    console.error("Error in script:", error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

main();

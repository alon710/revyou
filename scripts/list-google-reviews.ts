#!/usr/bin/env tsx

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import { listReviews, starRatingToNumber, type GoogleReview } from "@/lib/google/reviews";
import { decryptToken } from "@/lib/google/business-profile";

interface BusinessWithAccount {
  businessId: string;
  businessName: string;
  googleBusinessId: string;
  userId: string;
  accountId: string;
}

async function getConnectedBusinesses(db: ReturnType<typeof drizzle<typeof schema>>): Promise<BusinessWithAccount[]> {
  const businessList = await db.query.businesses.findMany({
    where: eq(schema.businesses.connected, true),
    with: {
      account: {
        with: {
          userAccounts: true,
        },
      },
    },
  });

  return businessList
    .filter((b) => b.googleBusinessId && b.account.userAccounts && b.account.userAccounts.length > 0)
    .map((b) => {
      const userAccount = b.account.userAccounts
        .filter((ua) => ua.role === "owner")
        .sort((a, c) => {
          const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
          const dateC = c.addedAt ? new Date(c.addedAt).getTime() : 0;
          if (dateA !== dateC) return dateA - dateC;
          return a.userId.localeCompare(c.userId);
        })[0];

      return {
        businessId: b.id,
        businessName: b.name,
        googleBusinessId: b.googleBusinessId!,
        userId: userAccount.userId,
        accountId: b.accountId,
      };
    });
}

async function getAccountRefreshToken(
  db: ReturnType<typeof drizzle<typeof schema>>,
  accountId: string
): Promise<string | null> {
  try {
    const account = await db.query.accounts.findFirst({
      where: eq(schema.accounts.id, accountId),
    });

    if (!account?.googleRefreshToken) {
      return null;
    }

    return await decryptToken(account.googleRefreshToken);
  } catch (error) {
    console.error("Error fetching account refresh token:", error);
    return null;
  }
}

function formatReviewPreview(text: string | undefined, maxLength: number = 60): string {
  if (!text) return "(no text)";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

async function main() {
  console.log("\n🔍 Fetching Google Reviews for Connected Businesses\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const client = postgres(process.env.DATABASE_URL, {
    max: 1,
  });

  const db = drizzle(client, { schema });

  try {
    const connectedBusinesses = await getConnectedBusinesses(db);

    if (connectedBusinesses.length === 0) {
      console.log("\n⚠️  No connected businesses found.");
      console.log("   Please connect a business first via the app.");
      return;
    }

    console.log(`\n📊 Found ${connectedBusinesses.length} connected business(es)\n`);

    let totalReviews = 0;
    const testCommands: string[] = [];

    for (const business of connectedBusinesses) {
      console.log(`\n${"=".repeat(80)}`);
      console.log(`🏢 Business: ${business.businessName}`);
      console.log(`📍 Location ID: ${business.googleBusinessId}`);
      console.log(`${"=".repeat(80)}\n`);

      const refreshToken = await getAccountRefreshToken(db, business.accountId);

      if (!refreshToken) {
        console.log("❌ No refresh token found for this business");
        continue;
      }

      try {
        const reviews = await listReviews(
          business.googleBusinessId,
          refreshToken,
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );

        if (reviews.length === 0) {
          console.log("📭 No reviews found for this business\n");
          continue;
        }

        console.log(`✅ Found ${reviews.length} review(s):\n`);
        totalReviews += reviews.length;

        reviews.forEach((review: GoogleReview, index: number) => {
          const rating = starRatingToNumber(review.starRating);
          const stars = "⭐".repeat(rating);
          const date = formatDate(review.createTime);
          const textPreview = formatReviewPreview(review.comment);

          console.log(`${index + 1}. ${stars} (${rating}/5)`);
          console.log(`   👤 Reviewer: ${review.reviewer.displayName}`);
          console.log(`   📅 Date: ${date}`);
          console.log(`   💬 Text: ${textPreview}`);
          console.log(`   🔗 Resource Name: ${review.name}`);
          console.log(`   🆔 Review ID: ${review.reviewId}`);

          testCommands.push(
            `npm run test:webhook -- \\
  --location "${business.googleBusinessId}" \\
  --review "${review.name}" \\
  --type new`
          );

          console.log("");
        });
      } catch (error) {
        console.error("❌ Error fetching reviews:", error instanceof Error ? error.message : String(error));
      }
    }

    console.log(`${"=".repeat(80)}`);
    console.log(`\n📈 Summary: ${totalReviews} total review(s) across ${connectedBusinesses.length} business(es)\n`);

    if (testCommands.length > 0) {
      console.log(`${"=".repeat(80)}`);
      console.log("\n🧪 Production Webhook Test Commands\n");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      console.log("⚠️  WARNING: These commands publish to Pub/Sub and trigger the PRODUCTION");
      console.log("   webhook at https://bottie.ai/api/webhooks/google-reviews\n");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

      testCommands.forEach((cmd, index) => {
        console.log(`# Command ${index + 1} of ${testCommands.length}:`);
        console.log(cmd);
        console.log("");
      });

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("\n📖 How to use:");
      console.log("   1. Copy one of the commands above");
      console.log("   2. Paste and run it in your terminal");
      console.log("   3. The command will:");
      console.log("      • Publish message to Pub/Sub topic: gmb-review-notifications");
      console.log("      • Trigger production webhook: https://bottie.ai/api/webhooks/google-reviews");
      console.log("      • Fetch review from Google API");
      console.log("      • Store review in production database");
      console.log("      • Generate AI reply (if configured)");
      console.log("   4. Check your production database to verify the review was processed\n");
    }
  } finally {
    await client.end();
  }
}

main()
  .then(() => {
    console.log("✅ Done!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });

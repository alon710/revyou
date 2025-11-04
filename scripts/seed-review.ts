import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";
import { randomBytes } from "crypto";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

function getRandomDaysAgo(maxDays: number): Date {
  const daysAgo = Math.floor(Math.random() * maxDays) + 1;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

if (getApps().length === 0) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!privateKey) {
    console.error("⚠️  Missing FIREBASE_ADMIN_PRIVATE_KEY in .env.local");
    process.exit(1);
  }

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

  if (!clientEmail) {
    console.error("⚠️  Missing FIREBASE_ADMIN_CLIENT_EMAIL in .env.local");
    process.exit(1);
  }

  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

const USER_ID = process.env.SEED_REVIEW_USER_ID || "";
const ACCOUNT_ID = process.env.SEED_REVIEW_ACCOUNT_ID || "";
const BUSINESS_ID = process.env.SEED_REVIEW_BUSINESS_ID || "";
const RATING = process.env.SEED_REVIEW_RATING;
const REVIEW_TEXT = process.env.SEED_REVIEW_TEXT || "";
const REVIEWER_NAME = process.env.SEED_REVIEW_REVIEWER_NAME;
const REVIEWER_PHOTO_URL = process.env.SEED_REVIEW_PHOTO_URL;

if (!USER_ID) {
  console.error("⚠️  Missing SEED_REVIEW_USER_ID in .env.local");
  console.error(
    "   Please set SEED_REVIEW_USER_ID to a valid Firebase Auth user ID"
  );
  process.exit(1);
}

if (!ACCOUNT_ID) {
  console.error("⚠️  Missing SEED_REVIEW_ACCOUNT_ID in .env.local");
  console.error(
    "   Please set SEED_REVIEW_ACCOUNT_ID (e.g., account_test_001)"
  );
  process.exit(1);
}

if (!BUSINESS_ID) {
  console.error("⚠️  Missing SEED_REVIEW_BUSINESS_ID in .env.local");
  console.error(
    "   Please set SEED_REVIEW_BUSINESS_ID (e.g., business_test_001)"
  );
  process.exit(1);
}

if (!RATING) {
  console.error("⚠️  Missing SEED_REVIEW_RATING in .env.local");
  console.error("   Please set SEED_REVIEW_RATING (1-5)");
  process.exit(1);
}

const ratingNumber = parseInt(RATING, 10);
if (isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
  console.error("⚠️  Invalid SEED_REVIEW_RATING value");
  console.error("   Rating must be a number between 1 and 5");
  process.exit(1);
}

if (!REVIEWER_NAME) {
  console.error("⚠️  Missing SEED_REVIEW_REVIEWER_NAME in .env.local");
  console.error("   Please set SEED_REVIEW_REVIEWER_NAME (e.g., 'John Doe')");
  process.exit(1);
}

if (REVIEWER_NAME.length < 1 || REVIEWER_NAME.length > 200) {
  console.error("⚠️  Invalid SEED_REVIEW_REVIEWER_NAME length");
  console.error("   Reviewer name must be between 1 and 200 characters");
  process.exit(1);
}

if (REVIEW_TEXT && REVIEW_TEXT.length > 5000) {
  console.error("⚠️  Invalid SEED_REVIEW_TEXT length");
  console.error("   Review text must be 5000 characters or less");
  process.exit(1);
}

async function seedReview() {
  console.log("🌱 Starting review seeding...\n");

  try {
    console.log(`🔍 Verifying account ${ACCOUNT_ID}...`);
    const accountRef = db
      .collection("users")
      .doc(USER_ID)
      .collection("accounts")
      .doc(ACCOUNT_ID);

    const accountDoc = await accountRef.get();
    if (!accountDoc.exists) {
      console.error(
        `⚠️  Account ${ACCOUNT_ID} does not exist for user ${USER_ID}`
      );
      console.error(
        "   Please ensure the account exists or run seed-database.ts first"
      );
      process.exit(1);
    }

    const accountData = accountDoc.data();
    console.log(`✅ Account found: ${accountData?.accountName || ACCOUNT_ID}`);

    console.log(`🔍 Verifying business ${BUSINESS_ID}...`);
    const businessRef = db
      .collection("users")
      .doc(USER_ID)
      .collection("accounts")
      .doc(ACCOUNT_ID)
      .collection("businesses")
      .doc(BUSINESS_ID);

    const businessDoc = await businessRef.get();
    if (!businessDoc.exists) {
      console.error(
        `⚠️  Business ${BUSINESS_ID} does not exist in account ${ACCOUNT_ID}`
      );
      console.error(
        "   Please ensure the business exists or run seed-database.ts first"
      );
      process.exit(1);
    }

    const businessData = businessDoc.data();
    console.log(`✅ Business found: ${businessData?.name || BUSINESS_ID}\n`);

    const reviewId = `google_review_${randomBytes(8).toString("hex")}`;
    const googleReviewId = reviewId;

    const reviewDate = getRandomDaysAgo(7);
    const receivedAt = addMinutes(reviewDate, 5);

    const reviewData: any = {
      googleReviewId,
      name: REVIEWER_NAME,
      rating: ratingNumber,
      text: REVIEW_TEXT,
      date: Timestamp.fromDate(reviewDate),
      receivedAt: Timestamp.fromDate(receivedAt),
      replyStatus: "pending",
    };

    if (REVIEWER_PHOTO_URL) {
      reviewData.photoUrl = REVIEWER_PHOTO_URL;
    }

    console.log("⭐ Creating review document...");
    await db
      .collection("users")
      .doc(USER_ID)
      .collection("accounts")
      .doc(ACCOUNT_ID)
      .collection("businesses")
      .doc(BUSINESS_ID)
      .collection("reviews")
      .doc(reviewId)
      .set(reviewData);

    console.log(`✅ Review created successfully!\n`);
    console.log("📊 Review Details:");
    console.log(`  - Review ID: ${reviewId}`);
    console.log(`  - Business: ${businessData?.name || BUSINESS_ID}`);
    console.log(`  - Reviewer: ${REVIEWER_NAME}`);
    console.log(`  - Rating: ${ratingNumber}⭐`);
    console.log(`  - Review Text: ${REVIEW_TEXT || "(empty)"}`);
    console.log(`  - Review Date: ${reviewDate.toISOString()}`);
    console.log(`  - Status: pending`);

    const starConfigs = businessData?.config?.starConfigs;
    const starConfig = starConfigs?.[ratingNumber];

    if (starConfig?.autoReply) {
      console.log(
        `\n🤖 Auto-reply is ENABLED for ${ratingNumber}-star reviews`
      );
      console.log(
        "   When Cloud Functions are deployed, this review will automatically:"
      );
      console.log("   1. Generate an AI reply using Gemini");
      console.log("   2. Post the reply automatically");
      console.log("   3. Send an email notification (if enabled)");
    } else {
      console.log(
        `\n📝 Auto-reply is DISABLED for ${ratingNumber}-star reviews`
      );
      console.log(
        "   When Cloud Functions are deployed, this review will automatically:"
      );
      console.log("   1. Generate an AI reply using Gemini");
      console.log("   2. Wait for manual approval before posting");
      console.log("   3. Send an email notification (if enabled)");
    }

    if (businessData?.emailOnNewReview) {
      console.log("\n📧 Email notifications are ENABLED for this business");
    } else {
      console.log("\n📧 Email notifications are DISABLED for this business");
    }

    console.log("\n✨ Review seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding review:", error);
    process.exit(1);
  }
}

seedReview()
  .then(() => {
    console.log("\n✅ Seeding complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  });

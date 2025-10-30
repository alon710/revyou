import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";
import { randomBytes } from "crypto";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Helper function to get a random date within the last N days
function getRandomDaysAgo(maxDays: number): Date {
  const daysAgo = Math.floor(Math.random() * maxDays) + 1;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// Helper function to add minutes to a date
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  const privateKey =
    process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;

  if (!privateKey) {
    console.error("⚠️  Missing FIREBASE_ADMIN_PRIVATE_KEY in .env.local");
    process.exit(1);
  }

  const clientEmail =
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    process.env.FIREBASE_CLIENT_EMAIL;

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

// Validate and read environment variables
const USER_ID = process.env.SEED_REVIEW_USER_ID || "";
const LOCATION_ID = process.env.SEED_REVIEW_LOCATION_ID || "";
const RATING = process.env.SEED_REVIEW_RATING;
const REVIEW_TEXT = process.env.SEED_REVIEW_TEXT || "";
const REVIEWER_NAME = process.env.SEED_REVIEW_REVIEWER_NAME;
const REVIEWER_PHOTO_URL = process.env.SEED_REVIEW_PHOTO_URL;

// Validate required parameters
if (!USER_ID) {
  console.error("⚠️  Missing SEED_REVIEW_USER_ID in .env.local");
  console.error(
    "   Please set SEED_REVIEW_USER_ID to a valid Firebase Auth user ID"
  );
  process.exit(1);
}

if (!LOCATION_ID) {
  console.error("⚠️  Missing SEED_REVIEW_LOCATION_ID in .env.local");
  console.error(
    "   Please set SEED_REVIEW_LOCATION_ID (e.g., location_test_001)"
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
    // Verify that the location exists
    console.log(`🔍 Verifying location ${LOCATION_ID}...`);
    const locationRef = db
      .collection("users")
      .doc(USER_ID)
      .collection("locations")
      .doc(LOCATION_ID);

    const locationDoc = await locationRef.get();
    if (!locationDoc.exists) {
      console.error(
        `⚠️  Location ${LOCATION_ID} does not exist for user ${USER_ID}`
      );
      console.error(
        "   Please ensure the location exists or run seed-database.ts first"
      );
      process.exit(1);
    }

    const locationData = locationDoc.data();
    console.log(`✅ Location found: ${locationData?.name || LOCATION_ID}\n`);

    // Generate unique IDs
    const reviewId = `google_review_${randomBytes(8).toString("hex")}`;
    const googleReviewId = reviewId; // Use same ID for simplicity

    // Generate timestamps
    const reviewDate = getRandomDaysAgo(7); // Random date within last week
    const receivedAt = addMinutes(reviewDate, 5); // Received 5 minutes after review posted

    // Build review data object (excluding the document ID)
    const reviewData: any = {
      googleReviewId,
      reviewerName: REVIEWER_NAME,
      rating: ratingNumber,
      reviewText: REVIEW_TEXT,
      reviewDate: Timestamp.fromDate(reviewDate),
      receivedAt: Timestamp.fromDate(receivedAt),
      replyStatus: "pending",
    };

    // Add optional reviewer photo URL if provided
    if (REVIEWER_PHOTO_URL) {
      reviewData.reviewerPhotoUrl = REVIEWER_PHOTO_URL;
    }

    // Create the review document
    console.log("⭐ Creating review document...");
    await db
      .collection("users")
      .doc(USER_ID)
      .collection("locations")
      .doc(LOCATION_ID)
      .collection("reviews")
      .doc(reviewId)
      .set(reviewData);

    console.log(`✅ Review created successfully!\n`);
    console.log("📊 Review Details:");
    console.log(`  - Review ID: ${reviewId}`);
    console.log(`  - Location: ${locationData?.name || LOCATION_ID}`);
    console.log(`  - Reviewer: ${REVIEWER_NAME}`);
    console.log(`  - Rating: ${ratingNumber}⭐`);
    console.log(`  - Review Text: ${REVIEW_TEXT || "(empty)"}`);
    console.log(`  - Review Date: ${reviewDate.toISOString()}`);
    console.log(`  - Status: pending`);

    // Check if auto-reply is enabled for this rating
    const starConfigs = locationData?.config?.starConfigs;
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

    if (locationData?.emailOnNewReview) {
      console.log("\n📧 Email notifications are ENABLED for this location");
    } else {
      console.log("\n📧 Email notifications are DISABLED for this location");
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

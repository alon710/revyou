import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { PubSub } from "@google-cloud/pubsub";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

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

// Environment variables for the script
const USER_ID = process.env.SEED_REVIEW_USER_ID || "";
const ACCOUNT_ID = process.env.SEED_REVIEW_ACCOUNT_ID || "";
const BUSINESS_ID = process.env.SEED_REVIEW_BUSINESS_ID || "";
const TEST_REVIEW_ID = process.env.TEST_REVIEW_ID || "";
const PROJECT_ID =
  process.env.NEXT_PUBLIC_GCP_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "";
const TOPIC_NAME = process.env.PUBSUB_TOPIC_NAME || "gmb-review-notifications";

// Validation
if (!USER_ID) {
  console.error("⚠️  Missing SEED_REVIEW_USER_ID in .env.local");
  console.error(
    "   Please set SEED_REVIEW_USER_ID to a valid Firebase Auth user ID"
  );
  process.exit(1);
}

if (!ACCOUNT_ID) {
  console.error("⚠️  Missing SEED_REVIEW_ACCOUNT_ID in .env.local");
  console.error("   Please set SEED_REVIEW_ACCOUNT_ID (e.g., account_test_001)");
  process.exit(1);
}

if (!BUSINESS_ID) {
  console.error("⚠️  Missing SEED_REVIEW_BUSINESS_ID in .env.local");
  console.error(
    "   Please set SEED_REVIEW_BUSINESS_ID (e.g., business_test_001)"
  );
  process.exit(1);
}

if (!TEST_REVIEW_ID) {
  console.error("⚠️  Missing TEST_REVIEW_ID in .env.local");
  console.error(
    "   Please set TEST_REVIEW_ID (e.g., review_12345 or any unique ID)"
  );
  process.exit(1);
}

if (!PROJECT_ID) {
  console.error("⚠️  Missing GCP project ID in .env.local");
  console.error(
    "   Please set NEXT_PUBLIC_GCP_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  );
  process.exit(1);
}

interface PubSubNotificationData {
  type: "NEW_REVIEW";
  review: string; // Format: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
  location: string; // Format: accounts/{accountId}/locations/{locationId}
}

async function seedPubSubNotification() {
  console.log("🌱 Starting Pub/Sub notification seeding...\n");

  try {
    // Verify user exists
    console.log(`🔍 Verifying user ${USER_ID}...`);
    const userRef = db.collection("users").doc(USER_ID);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      console.error(`⚠️  User ${USER_ID} does not exist`);
      console.error(
        "   Please ensure the user exists or run seed-database.ts first"
      );
      process.exit(1);
    }
    console.log(`✅ User found`);

    // Verify account exists
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

    // Verify business exists
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
    console.log(`✅ Business found: ${businessData?.name || BUSINESS_ID}`);

    // Get the googleBusinessId (which is the locationName)
    const googleBusinessId = businessData?.googleBusinessId;
    if (!googleBusinessId) {
      console.error(
        `⚠️  Business ${BUSINESS_ID} does not have a googleBusinessId`
      );
      console.error("   This field is required for Pub/Sub notifications");
      process.exit(1);
    }

    console.log(`📍 Google Business ID: ${googleBusinessId}`);

    // Extract account name from googleBusinessId
    // Format: accounts/{accountId}/locations/{locationId}
    const googleAccountName = googleBusinessId.split("/locations")[0];
    if (!googleAccountName) {
      console.error("⚠️  Invalid googleBusinessId format");
      console.error(
        "   Expected format: accounts/{accountId}/locations/{locationId}"
      );
      process.exit(1);
    }

    console.log(`📍 Google Account Name: ${googleAccountName}\n`);

    // Construct the notification data
    const locationName = googleBusinessId; // accounts/{accountId}/locations/{locationId}
    const reviewName = `${locationName}/reviews/${TEST_REVIEW_ID}`; // accounts/{accountId}/locations/{locationId}/reviews/{reviewId}

    const notificationData: PubSubNotificationData = {
      type: "NEW_REVIEW",
      review: reviewName,
      location: locationName,
    };

    console.log("📦 Notification Data:");
    console.log(`  - Type: ${notificationData.type}`);
    console.log(`  - Review: ${notificationData.review}`);
    console.log(`  - Location: ${notificationData.location}\n`);

    // Initialize Pub/Sub client
    console.log("🔌 Initializing Pub/Sub client...");
    const pubSubClient = new PubSub({ projectId: PROJECT_ID });
    const topic = pubSubClient.topic(TOPIC_NAME);

    // Check if topic exists
    console.log(`🔍 Checking if topic ${TOPIC_NAME} exists...`);
    const [topicExists] = await topic.exists();
    if (!topicExists) {
      console.error(`⚠️  Pub/Sub topic '${TOPIC_NAME}' does not exist`);
      console.error(
        `   Please create it using: gcloud pubsub topics create ${TOPIC_NAME} --project=${PROJECT_ID}`
      );
      process.exit(1);
    }
    console.log(`✅ Topic exists\n`);

    // Publish the message
    console.log("📤 Publishing notification to Pub/Sub...");
    const messageBuffer = Buffer.from(JSON.stringify(notificationData));
    const messageId = await topic.publishMessage({ data: messageBuffer });

    console.log(`✅ Message published successfully!`);
    console.log(`   Message ID: ${messageId}\n`);

    console.log("📋 Next Steps:");
    console.log("  1. The Cloud Function will receive this notification");
    console.log("  2. It will fetch the review from Google My Business API");
    console.log("  3. Create a review document in Firestore");
    console.log("  4. Trigger AI reply generation (onReviewCreate function)");
    console.log("  5. Send email notification (if enabled)\n");

    console.log("⚠️  Important Notes:");
    console.log(
      "  - The TEST_REVIEW_ID must be a valid review ID from Google My Business"
    );
    console.log("  - The Cloud Function will call the Google API with this ID");
    console.log(
      "  - If the review doesn't exist in GMB, the Cloud Function will fail"
    );
    console.log(
      "  - Make sure your account has a valid refresh token with proper scopes\n"
    );

    if (!businessData?.connected) {
      console.warn("⚠️  WARNING: Business is NOT connected");
      console.warn(
        "   The Cloud Function will skip processing this notification"
      );
      console.warn(
        '   Set business.connected = true to process notifications\n'
      );
    }

    console.log("✨ Pub/Sub notification seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding Pub/Sub notification:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Error stack:", error.stack);
    }
    process.exit(1);
  }
}

seedPubSubNotification()
  .then(() => {
    console.log("\n✅ Seeding complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  });

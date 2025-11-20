#!/usr/bin/env tsx

import { PubSub } from "@google-cloud/pubsub";

interface PublishOptions {
  location: string;
  review: string;
  type: "NEW_REVIEW" | "UPDATED_REVIEW";
  projectId?: string;
  topicName?: string;
}

interface PubSubNotificationData {
  type: "NEW_REVIEW" | "UPDATED_REVIEW";
  review: string;
  location: string;
}

async function publishTestNotification(options: PublishOptions): Promise<void> {
  const {
    location,
    review,
    type,
    projectId = process.env.NEXT_PUBLIC_GCP_PROJECT_ID || "review-ai-reply",
    topicName = process.env.PUBSUB_TOPIC_NAME || "gmb-review-notifications",
  } = options;

  console.log("📤 Publishing test notification to Pub/Sub");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Project ID: ${projectId}`);
  console.log(`Topic Name: ${topicName}`);
  console.log(`Notification Type: ${type}`);
  console.log(`Location: ${location}`);
  console.log(`Review: ${review}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const pubSubClient = new PubSub({ projectId });

  const notificationData: PubSubNotificationData = {
    type,
    review,
    location,
  };

  const notificationJson = JSON.stringify(notificationData);
  const messageData = Buffer.from(notificationJson, "utf-8").toString("base64");

  console.log("📝 Notification payload:");
  console.log(JSON.stringify(notificationData, null, 2));
  console.log("\n🔐 Base64-encoded data:");
  console.log(messageData.substring(0, 80) + "...\n");

  try {
    const topic = pubSubClient.topic(topicName);
    const messageId = await topic.publishMessage({
      data: Buffer.from(messageData, "base64"),
    });

    console.log("✅ Message published successfully!");
    console.log(`📬 Message ID: ${messageId}`);
    console.log("\n💡 Message published to Pub/Sub topic: gmb-review-notifications");
    console.log("   The production webhook will receive this message shortly:");
    console.log("   https://bottie.ai/api/webhooks/google-reviews");
    console.log("\n📊 To verify processing:");
    console.log("   • Check your production database for the new/updated review");
    console.log("   • Check production logs if available");
  } catch (error) {
    console.error("❌ Error publishing message:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    process.exit(1);
  }
}

function parseArgs(): PublishOptions | null {
  const args = process.argv.slice(2);

  const options: Partial<PublishOptions> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--location":
      case "-l":
        options.location = args[++i];
        break;
      case "--review":
      case "-r":
        options.review = args[++i];
        break;
      case "--type":
      case "-t":
        const typeArg = args[++i].toUpperCase();
        if (typeArg === "NEW" || typeArg === "NEW_REVIEW") {
          options.type = "NEW_REVIEW";
        } else if (typeArg === "UPDATED" || typeArg === "UPDATED_REVIEW") {
          options.type = "UPDATED_REVIEW";
        } else {
          console.error(`❌ Invalid type: ${typeArg}. Use "new" or "updated"`);
          return null;
        }
        break;
      case "--project-id":
      case "-p":
        options.projectId = args[++i];
        break;
      case "--topic":
        options.topicName = args[++i];
        break;
      case "--help":
      case "-h":
        showHelp();
        return null;
      default:
        console.error(`❌ Unknown argument: ${arg}`);
        showHelp();
        return null;
    }
  }

  if (!options.location || !options.review || !options.type) {
    console.error("❌ Missing required arguments\n");
    showHelp();
    return null;
  }

  return options as PublishOptions;
}

function showHelp(): void {
  console.log(`
📤 Google Reviews Pub/Sub Webhook Tester

Usage:
  npm run test:webhook -- [options]
  yarn test:webhook [options]

Required Options:
  -l, --location <id>    Google Business location ID (googleBusinessId)
                         Format: accounts/123/locations/456

  -r, --review <name>    Google Review resource name
                         Format: accounts/123/locations/456/reviews/789

  -t, --type <type>      Notification type: "new" or "updated"

Optional:
  -p, --project-id <id>  GCP Project ID (default: from NEXT_PUBLIC_GCP_PROJECT_ID)
  --topic <name>         Pub/Sub topic name (default: from PUBSUB_TOPIC_NAME)
  -h, --help             Show this help message

Examples:
  # Test new review notification
  npm run test:webhook -- \\
    --location "accounts/123/locations/456" \\
    --review "accounts/123/locations/456/reviews/789" \\
    --type new

  # Test updated review notification
  npm run test:webhook -- \\
    --location "accounts/123/locations/456" \\
    --review "accounts/123/locations/456/reviews/789" \\
    --type updated

  # With custom project ID
  npm run test:webhook -- \\
    -l "accounts/123/locations/456" \\
    -r "accounts/123/locations/456/reviews/789" \\
    -t new \\
    -p "my-project-id"

Notes:
  ⚠️  WARNING: This publishes to Pub/Sub and triggers the PRODUCTION webhook
      at https://bottie.ai/api/webhooks/google-reviews

  • Make sure you have authenticated with Google Cloud:
    gcloud auth application-default login

  • To get real business/review IDs, run:
    npm run list:reviews

  • To verify the webhook processed your message:
    - Check your production database for the new/updated review
    - Check production logs if you have access
  `);
}

async function main() {
  console.log("\n🚀 Google Reviews Pub/Sub Test Script\n");

  const options = parseArgs();

  if (!options) {
    process.exit(1);
  }

  await publishTestNotification(options);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

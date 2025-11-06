import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { getAccount } from "@/lib/firebase/admin-accounts";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import {
  subscribeToNotifications,
  decryptToken,
} from "@/lib/google/business-profile";
import { businessSchemaAdmin } from "@/lib/validation/database.admin";
import { getDefaultBusinessConfig } from "@/lib/firebase/business-config";

const db = getFirestore();

interface CreateBusinessRequest {
  accountId: string;
  googleBusinessId: string;
  name: string;
  address: string;
  phoneNumber?: string | null;
  websiteUrl?: string | null;
  mapsUrl?: string | null;
  description?: string | null;
  photoUrl?: string | null;
}

export async function POST(request: NextRequest) {
  let createdBusinessId: string | null = null;
  let userId: string | null = null;
  let accountId: string | null = null;

  try {
    // 1. Authenticate user
    const authResult = await getAuthenticatedUserId();
    userId = authResult.userId;

    // 2. Parse and validate request body
    const body: CreateBusinessRequest = await request.json();
    accountId = body.accountId;

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    // 3. Get account details
    const account = await getAccount(userId, accountId);
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // 4. Create business document in Firestore
    // Build config with defaults
    const defaultConfig = getDefaultBusinessConfig();
    const businessConfig = {
      ...defaultConfig,
      name: body.name,
      description: body.description ?? "",
      phoneNumber: body.phoneNumber ?? "",
    };

    const businessData = {
      googleBusinessId: body.googleBusinessId,
      name: body.name,
      address: body.address,
      phoneNumber: body.phoneNumber ?? null,
      websiteUrl: body.websiteUrl ?? null,
      mapsUrl: body.mapsUrl ?? null,
      description: body.description ?? null,
      photoUrl: body.photoUrl ?? null,
      config: businessConfig,
      emailOnNewReview: true,
      connectedAt: Timestamp.now(),
      connected: true,
    };

    // Validate business data
    businessSchemaAdmin.parse({ id: "temp", ...businessData });

    const businessRef = await db
      .collection("users")
      .doc(userId)
      .collection("accounts")
      .doc(accountId)
      .collection("businesses")
      .add(businessData);

    createdBusinessId = businessRef.id;
    console.log("Business created:", createdBusinessId);

    // 5. Subscribe to notifications
    try {
      // Extract Google account name from business ID
      // Format: accounts/{accountId}/locations/{locationId}
      const googleAccountName = body.googleBusinessId.split("/locations")[0];

      // Construct Pub/Sub topic
      const projectId =
        process.env.NEXT_PUBLIC_GCP_PROJECT_ID || "review-ai-reply";
      const topicName =
        process.env.PUBSUB_TOPIC_NAME || "gmb-review-notifications";
      const pubsubTopic = `projects/${projectId}/topics/${topicName}`;

      // Decrypt refresh token
      const refreshToken = await decryptToken(account.googleRefreshToken);

      // Subscribe to notifications
      await subscribeToNotifications(
        googleAccountName,
        pubsubTopic,
        refreshToken
      );

      // Update account with Google account name (if not already set)
      if (!account.googleAccountName) {
        await db
          .collection("users")
          .doc(userId)
          .collection("accounts")
          .doc(accountId)
          .update({ googleAccountName });
      }

      console.log(
        "Successfully subscribed to notifications:",
        googleAccountName
      );

      // 6. Return success
      return NextResponse.json({
        success: true,
        businessId: createdBusinessId,
      });
    } catch (subscriptionError) {
      // Subscription failed - rollback business creation
      console.error(
        "Subscription failed, rolling back business:",
        subscriptionError
      );

      if (createdBusinessId && userId && accountId) {
        try {
          await db
            .collection("users")
            .doc(userId)
            .collection("accounts")
            .doc(accountId)
            .collection("businesses")
            .doc(createdBusinessId)
            .delete();
          console.log("Business rolled back:", createdBusinessId);
        } catch (deleteError) {
          console.error("Failed to rollback business:", deleteError);
        }
      }

      // Return subscription error to user
      return NextResponse.json(
        {
          error: "Failed to subscribe to notifications",
          details:
            subscriptionError instanceof Error
              ? subscriptionError.message
              : String(subscriptionError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Business creation error:", error);

    // If we created a business but failed elsewhere, clean it up
    if (createdBusinessId && userId && accountId) {
      try {
        await db
          .collection("users")
          .doc(userId)
          .collection("accounts")
          .doc(accountId)
          .collection("businesses")
          .doc(createdBusinessId)
          .delete();
        console.log("Business cleaned up after error:", createdBusinessId);
      } catch (deleteError) {
        console.error("Failed to clean up business:", deleteError);
      }
    }

    return NextResponse.json(
      {
        error: "Failed to create business",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

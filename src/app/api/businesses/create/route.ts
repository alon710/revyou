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
    const authResult = await getAuthenticatedUserId();
    userId = authResult.userId;

    const body: CreateBusinessRequest = await request.json();
    accountId = body.accountId;

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    const account = await getAccount(userId, accountId);
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

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

    businessSchemaAdmin.parse({ id: "temp", ...businessData });

    const businessRef = await db
      .collection("users")
      .doc(userId)
      .collection("accounts")
      .doc(accountId)
      .collection("businesses")
      .add(businessData);

    createdBusinessId = businessRef.id;

    try {
      const googleAccountName = body.googleBusinessId.split("/locations")[0];

      const projectId =
        process.env.NEXT_PUBLIC_GCP_PROJECT_ID || "review-ai-reply";
      const topicName =
        process.env.PUBSUB_TOPIC_NAME || "gmb-review-notifications";
      const pubsubTopic = `projects/${projectId}/topics/${topicName}`;

      const refreshToken = await decryptToken(account.googleRefreshToken);

      await subscribeToNotifications(
        googleAccountName,
        pubsubTopic,
        refreshToken
      );

      if (!account.googleAccountName) {
        await db
          .collection("users")
          .doc(userId)
          .collection("accounts")
          .doc(accountId)
          .update({ googleAccountName });
      }

      return NextResponse.json({
        success: true,
        businessId: createdBusinessId,
      });
    } catch (subscriptionError) {
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
        } catch (deleteError) {
          console.error("Failed to rollback business:", deleteError);
        }
      }

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

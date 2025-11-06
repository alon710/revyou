import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { getAccount } from "@/lib/firebase/admin-accounts";
import { getAccountBusinessesAdmin } from "@/lib/firebase/businesses.admin";
import { getFirestore } from "firebase-admin/firestore";
import {
  subscribeToNotifications,
  decryptToken,
} from "@/lib/google/business-profile";

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUserId();
    const { userId } = authResult;

    const { accountId } = await request.json();
    if (!accountId) {
      return NextResponse.json(
        { error: "accountId required" },
        { status: 400 }
      );
    }

    const account = await getAccount(userId, accountId);

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if already subscribed
    if (account.googleAccountName) {
      console.log("Already subscribed to notifications:", accountId);
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }

    // Get businesses to extract Google account name
    const businesses = await getAccountBusinessesAdmin(userId, accountId);
    if (businesses.length === 0) {
      return NextResponse.json(
        { error: "No businesses found" },
        { status: 400 }
      );
    }

    // Extract account name from first business
    // Format: accounts/{accountId}/locations/{locationId}
    const googleAccountName =
      businesses[0].googleBusinessId.split("/locations")[0];

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

    // Update account with Google account name
    const db = getFirestore();
    await db
      .collection("users")
      .doc(userId)
      .collection("accounts")
      .doc(accountId)
      .update({ googleAccountName });

    console.log("Successfully subscribed to notifications:", googleAccountName);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      {
        error: "Subscription failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

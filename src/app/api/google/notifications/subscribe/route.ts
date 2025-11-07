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

    if (account.googleAccountName) {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }

    if (!account.googleRefreshToken) {
      console.error("Missing Google refresh token for accountId:", accountId);
      return NextResponse.json(
        { error: "Missing Google refresh token" },
        { status: 400 }
      );
    }

    const businesses = await getAccountBusinessesAdmin(userId, accountId);
    if (businesses.length === 0) {
      return NextResponse.json(
        { error: "No businesses found" },
        { status: 400 }
      );
    }

    const googleAccountName =
      businesses[0].googleBusinessId.split("/locations")[0];

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

    const db = getFirestore();
    await db
      .collection("users")
      .doc(userId)
      .collection("accounts")
      .doc(accountId)
      .update({ googleAccountName });

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

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { AccountsController, BusinessesController } from "@/lib/controllers";
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

    const accountsController = new AccountsController(userId);
    const businessesController = new BusinessesController(userId, accountId);

    const account = await accountsController.getAccount(accountId);

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

    const businesses = await businessesController.getBusinesses();
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

    await accountsController.updateAccount(accountId, { googleAccountName });

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

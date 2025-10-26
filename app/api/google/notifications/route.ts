import { NextRequest, NextResponse } from "next/server";
import {
  enableNotifications,
  getPubSubTopicName,
} from "@/lib/google/notifications";
import {
  getBusinessAdmin,
  updateBusinessAdmin,
} from "@/lib/firebase/businesses.admin";
import { getUserAdmin } from "@/lib/firebase/users.admin";
import { adminAuth } from "@/lib/firebase/admin";
import { decryptToken } from "@/lib/google/oauth";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { businessId } = await req.json();

    if (!businessId) {
      return NextResponse.json(
        { error: "businessId is required" },
        { status: 400 }
      );
    }

    const business = await getBusinessAdmin(userId, businessId);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const user = await getUserAdmin(userId);

    if (!user || !user.googleRefreshToken) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 400 }
      );
    }

    const refreshToken = decryptToken(user.googleRefreshToken);

    const topicName = getPubSubTopicName();

    await enableNotifications(
      refreshToken,
      `accounts/${business.googleAccountId}`,
      topicName
    );

    await updateBusinessAdmin(userId, businessId, {
      notificationsEnabled: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error enabling notifications:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to enable notifications",
      },
      { status: 500 }
    );
  }
}

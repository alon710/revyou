import { NextRequest, NextResponse } from "next/server";
import {
  enableNotifications,
  getPubSubTopicName,
} from "@/lib/google/notifications";
import { getBusiness } from "@/lib/firebase/businesses";
import { getUser } from "@/lib/firebase/users";
import { adminAuth } from "@/lib/firebase/admin";
import { decryptToken } from "@/lib/google/oauth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

/**
 * POST /api/google/notifications
 * Enable Pub/Sub notifications for a business
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get business ID from request
    const { businessId } = await req.json();

    if (!businessId) {
      return NextResponse.json(
        { error: "businessId is required" },
        { status: 400 }
      );
    }

    // Get business and verify ownership
    const business = await getBusiness(businessId);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    if (business.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get user's Google refresh token
    const user = await getUser(userId);

    if (!user || !user.googleRefreshToken) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 400 }
      );
    }

    // Decrypt refresh token
    const refreshToken = decryptToken(user.googleRefreshToken);

    // Get Pub/Sub topic name
    const topicName = getPubSubTopicName();

    // Enable notifications
    await enableNotifications(
      refreshToken,
      `accounts/${business.googleAccountId}`,
      topicName
    );

    // Update business record
    if (db) {
      const businessRef = doc(db, "businesses", businessId);
      await updateDoc(businessRef, {
        notificationsEnabled: true,
      });
    }

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

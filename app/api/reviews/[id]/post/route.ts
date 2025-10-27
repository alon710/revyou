import { NextRequest, NextResponse } from "next/server";
import { postReviewReply } from "@/lib/google/location-profile";
import { getReviewAdmin } from "@/lib/firebase/reviews.admin";
import { markAsPostedAdmin } from "@/lib/firebase/reviews.admin";
import { getLocationAdmin } from "@/lib/firebase/locations.admin";
import { getUserAdmin } from "@/lib/firebase/admin-users";
import { adminAuth } from "@/lib/firebase/admin";
import { decryptToken } from "@/lib/google/oauth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const authenticatedUserId = decodedToken.uid;

    const { id: reviewId } = await params;

    const { userId: requestUserId, businessId } = await req.json();

    if (requestUserId !== authenticatedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const fullReview = await getReviewAdmin(
      authenticatedUserId,
      businessId,
      reviewId
    );

    if (!fullReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const location = await getLocationAdmin(authenticatedUserId, businessId);

    if (!location) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const user = await getUserAdmin(authenticatedUserId);

    if (!user || !user.googleRefreshToken) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 400 }
      );
    }

    const refreshToken = decryptToken(user.googleRefreshToken);

    const replyText = fullReview.editedReply || fullReview.aiReply;

    if (!replyText) {
      return NextResponse.json({ error: "No reply to post" }, { status: 400 });
    }

    const reviewName = `accounts/${location.googleAccountId}/locations/${location.googleLocationId}/reviews/${fullReview.googleReviewId}`;

    await postReviewReply(refreshToken, reviewName, replyText);

    await markAsPostedAdmin(
      authenticatedUserId,
      businessId,
      reviewId,
      replyText,
      authenticatedUserId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error posting reply:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to post reply",
      },
      { status: 500 }
    );
  }
}

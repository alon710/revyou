import { NextRequest, NextResponse } from "next/server";
import { postReviewReply } from "@/lib/google/business-profile";
import {
  getReviewAdmin,
  markAsPostedAdmin,
} from "@/lib/firebase/reviews.admin";
import { getBusinessAdmin } from "@/lib/firebase/businesses.admin";
import { getUserAdmin } from "@/lib/firebase/users.admin";
import { adminAuth } from "@/lib/firebase/admin";
import { decryptToken } from "@/lib/google/oauth";

/**
 * POST /api/reviews/[id]/post
 * Post a review reply to Google Business Profile
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const authenticatedUserId = decodedToken.uid;

    // Get review ID from URL params
    const { id: reviewId } = await params;

    // Get userId and businessId from request body
    const { userId: requestUserId, businessId } = await req.json();

    // Verify ownership
    if (requestUserId !== authenticatedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get review using Admin SDK with direct path access
    const fullReview = await getReviewAdmin(
      authenticatedUserId,
      businessId,
      reviewId
    );

    if (!fullReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Get business and verify ownership using Admin SDK
    const business = await getBusinessAdmin(authenticatedUserId, businessId);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Get user to access Google refresh token using Admin SDK
    const user = await getUserAdmin(authenticatedUserId);

    if (!user || !user.googleRefreshToken) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 400 }
      );
    }

    // Decrypt refresh token
    const refreshToken = decryptToken(user.googleRefreshToken);

    // Determine which reply to post (edited takes precedence)
    const replyText = fullReview.editedReply || fullReview.aiReply;

    if (!replyText) {
      return NextResponse.json({ error: "No reply to post" }, { status: 400 });
    }

    // Construct review resource name
    // Format: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
    const reviewName = `accounts/${business.googleAccountId}/locations/${business.googleLocationId}/reviews/${fullReview.googleReviewId}`;

    // Post to Google
    await postReviewReply(refreshToken, reviewName, replyText);

    // Update review status using Admin SDK
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

    // We cannot mark as failed without userId and businessId
    // The error is logged and returned to the client
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to post reply",
      },
      { status: 500 }
    );
  }
}

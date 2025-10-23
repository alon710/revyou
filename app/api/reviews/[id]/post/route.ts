import { NextRequest, NextResponse } from "next/server";
import { postReviewReply } from "@/lib/google/business-profile";
import { getReview, markAsPosted, markAsFailed } from "@/lib/firebase/reviews";
import { getBusiness } from "@/lib/firebase/businesses";
import { getUser } from "@/lib/firebase/users";
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
    const userId = decodedToken.uid;

    // Get review
    const { id } = await params;
    const review = await getReview(id);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Get business and verify ownership
    const business = await getBusiness(review.businessId);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    if (business.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get user to access Google refresh token
    const user = await getUser(userId);

    if (!user || !user.googleRefreshToken) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 400 }
      );
    }

    // Decrypt refresh token
    const refreshToken = decryptToken(user.googleRefreshToken);

    // Determine which reply to post (edited takes precedence)
    const replyText = review.editedReply || review.aiReply;

    if (!replyText) {
      return NextResponse.json(
        { error: "No reply to post" },
        { status: 400 }
      );
    }

    // Construct review resource name
    // Format: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
    const reviewName = `accounts/${business.googleAccountId}/locations/${business.googleLocationId}/reviews/${review.googleReviewId}`;

    // Post to Google
    await postReviewReply(refreshToken, reviewName, replyText);

    // Update review status
    await markAsPosted(id, replyText, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error posting reply:", error);

    // Mark as failed
    const { id: failedId } = await params;
    try {
      await markAsFailed(failedId);
    } catch (updateError) {
      console.error("Error marking review as failed:", updateError);
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to post reply",
      },
      { status: 500 }
    );
  }
}

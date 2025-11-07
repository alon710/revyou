import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { getReviewAdmin } from "@/lib/firebase/reviews.admin";
import { getAccountGoogleRefreshToken } from "@/lib/firebase/admin-accounts";
import { decryptToken } from "@/lib/google/business-profile";
import { postReplyToGoogle } from "@/lib/google/reviews";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUserId();
    const { userId: authenticatedUserId } = authResult;
    const { id: reviewId } = await params;
    const { userId: requestUserId, accountId, businessId } = await req.json();

    if (requestUserId !== authenticatedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    const review = await getReviewAdmin(
      authenticatedUserId,
      accountId,
      businessId,
      reviewId
    );

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (!review.googleReviewName) {
      return NextResponse.json(
        {
          error:
            "Google review name not found - review may not be from Google My Business",
        },
        { status: 400 }
      );
    }

    if (!review.aiReply) {
      return NextResponse.json(
        { error: "No AI reply to post" },
        { status: 400 }
      );
    }

    const encryptedToken = await getAccountGoogleRefreshToken(
      authenticatedUserId,
      accountId
    );

    if (!encryptedToken) {
      return NextResponse.json(
        { error: "No refresh token found for account" },
        { status: 400 }
      );
    }

    const refreshToken = await decryptToken(encryptedToken);

    await postReplyToGoogle(
      review.googleReviewName,
      review.aiReply,
      refreshToken
    );

    const reviewRef = adminDb
      .collection("users")
      .doc(authenticatedUserId)
      .collection("accounts")
      .doc(accountId)
      .collection("businesses")
      .doc(businessId)
      .collection("reviews")
      .doc(reviewId);

    await reviewRef.update({
      replyStatus: "posted",
      postedReply: review.aiReply,
      postedAt: Timestamp.now(),
      postedBy: "user",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in post reply API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to post reply";
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

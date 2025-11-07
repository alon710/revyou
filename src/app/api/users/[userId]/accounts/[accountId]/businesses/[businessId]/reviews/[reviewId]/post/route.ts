import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsController } from "@/lib/controllers";
import { BusinessesController } from "@/lib/controllers";
import { AccountsController } from "@/lib/controllers";
import { postReviewReply } from "@/lib/google/reviews";

/**
 * POST /api/users/[userId]/accounts/[accountId]/businesses/[businessId]/reviews/[reviewId]/post
 * Post AI reply to Google My Business
 *
 * Body: { reply?: string } - Optional custom reply (defaults to aiReply)
 */
export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      userId: string;
      accountId: string;
      businessId: string;
      reviewId: string;
    }>;
  }
) {
  try {
    const { userId: authenticatedUserId } = await getAuthenticatedUserId();
    const { userId, accountId, businessId, reviewId } = await params;

    if (authenticatedUserId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot access another user's data" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const customReply = body.reply;

    // Get review
    const reviewController = new ReviewsController(
      userId,
      accountId,
      businessId
    );
    const review = await reviewController.getReview(reviewId);

    // Determine which reply to post
    const replyToPost = customReply || review.aiReply;
    if (!replyToPost) {
      return NextResponse.json(
        {
          error:
            "No reply to post. Generate AI reply first or provide custom reply.",
        },
        { status: 400 }
      );
    }

    // Get account for OAuth token
    const accountController = new AccountsController(userId);
    const account = await accountController.getAccount(accountId);

    // Get business for Google Business ID
    const businessController = new BusinessesController(userId, accountId);
    const business = await businessController.getBusiness(businessId);

    // Post reply to Google
    await postReviewReply({
      reviewName: review.googleReviewName || review.googleReviewId,
      reply: replyToPost,
      refreshToken: account.googleRefreshToken,
    });

    // Mark review as posted
    const updatedReview = await reviewController.markAsPosted(
      reviewId,
      replyToPost,
      userId
    );

    return NextResponse.json({
      success: true,
      review: updatedReview,
    });
  } catch (error) {
    console.error("Error posting review reply:", error);

    // Try to mark as failed
    try {
      const { userId, accountId, businessId, reviewId } = await params;
      const reviewController = new ReviewsController(
        userId,
        accountId,
        businessId
      );
      await reviewController.updateReview(reviewId, { replyStatus: "failed" });
    } catch (updateError) {
      console.error("Failed to mark review as failed:", updateError);
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to post reply",
      },
      { status: 500 }
    );
  }
}

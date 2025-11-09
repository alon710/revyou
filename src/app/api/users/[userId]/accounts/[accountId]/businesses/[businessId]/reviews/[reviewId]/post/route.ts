import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsController } from "@/lib/controllers";
import { AccountsController } from "@/lib/controllers";
import { postReplyToGoogle } from "@/lib/google/reviews";

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
      return NextResponse.json({ error: "Forbidden: Cannot access another user's data" }, { status: 403 });
    }

    const body = await req.json();
    const customReply = body.reply;

    const reviewController = new ReviewsController(userId, accountId, businessId);
    const review = await reviewController.getReview(reviewId);

    const replyToPost = customReply || review.aiReply;
    if (!replyToPost) {
      return NextResponse.json(
        {
          error: "No reply to post. Generate AI reply first or provide custom reply.",
        },
        { status: 400 }
      );
    }

    const accountController = new AccountsController(userId);
    const account = await accountController.getAccount(accountId);

    await postReplyToGoogle(review.googleReviewName || review.googleReviewId, replyToPost, account.googleRefreshToken);

    const updatedReview = await reviewController.markAsPosted(reviewId, replyToPost, userId);

    return NextResponse.json({
      success: true,
      review: updatedReview,
    });
  } catch (error) {
    console.error("Error posting review reply:", error);

    try {
      const { userId, accountId, businessId, reviewId } = await params;
      const reviewController = new ReviewsController(userId, accountId, businessId);
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

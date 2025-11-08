import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsController } from "@/lib/controllers";
import { getErrorStatusCode } from "@/lib/api/errors";

export async function GET(
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

    const controller = new ReviewsController(userId, accountId, businessId);
    const review = await controller.getReview(reviewId);

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch review",
      },
      { status: getErrorStatusCode(error) }
    );
  }
}

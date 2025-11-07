import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsController } from "@/lib/controllers";
import type { ReviewUpdate } from "@/lib/types";

/**
 * GET /api/users/[userId]/accounts/[accountId]/businesses/[businessId]/reviews/[reviewId]
 * Get a single review by ID
 */
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
      {
        status:
          error instanceof Error && error.message.includes("not found")
            ? 404
            : 500,
      }
    );
  }
}

/**
 * PUT /api/users/[userId]/accounts/[accountId]/businesses/[businessId]/reviews/[reviewId]
 * Update a review
 *
 * Body: ReviewUpdate
 */
export async function PUT(
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

    const body: ReviewUpdate = await req.json();

    const controller = new ReviewsController(userId, accountId, businessId);
    const review = await controller.updateReview(reviewId, body);

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update review",
      },
      { status: 500 }
    );
  }
}

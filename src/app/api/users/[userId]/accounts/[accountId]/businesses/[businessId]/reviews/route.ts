import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsController } from "@/lib/controllers";
import {
  parseSearchParams,
  reviewFiltersSchema,
} from "@/lib/utils/query-parser";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ userId: string; accountId: string; businessId: string }>;
  }
) {
  try {
    const { userId: authenticatedUserId } = await getAuthenticatedUserId();
    const { userId, accountId, businessId } = await params;

    if (authenticatedUserId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot access another user's data" },
        { status: 403 }
      );
    }

    const filters = parseSearchParams(
      req.nextUrl.searchParams,
      reviewFiltersSchema
    );

    const controller = new ReviewsController(userId, accountId, businessId);
    const reviews = await controller.getReviews(filters);

    return NextResponse.json({
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch reviews",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsController } from "@/lib/controllers";
import {
  parseSearchParams,
  reviewFiltersSchema,
} from "@/lib/utils/query-parser";

/**
 * GET /api/users/[userId]/accounts/[accountId]/businesses/[businessId]/reviews
 * List reviews with optional filtering
 *
 * Query parameters:
 * - ids: string[] - Filter by specific review IDs
 * - replyStatus: ReplyStatus[] - Filter by reply status (pending, rejected, posted, failed)
 * - rating: number[] - Filter by rating (1-5)
 * - dateFrom: Date - Filter reviews from this date
 * - dateTo: Date - Filter reviews until this date
 * - limit: number - Maximum number of reviews to return
 * - offset: number - Number of reviews to skip
 * - orderBy: ReviewSortField - Field to sort by (receivedAt, rating, date)
 * - orderDirection: 'asc' | 'desc' - Sort direction
 *
 * Example:
 * GET /api/users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews?replyStatus=pending&rating=1&rating=2&limit=20&orderBy=receivedAt&orderDirection=desc
 */
export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ userId: string; accountId: string; businessId: string }>;
  }
) {
  try {
    // Authenticate user
    const { userId: authenticatedUserId } = await getAuthenticatedUserId();
    const { userId, accountId, businessId } = await params;

    // Verify user is accessing their own data
    if (authenticatedUserId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot access another user's data" },
        { status: 403 }
      );
    }

    // Parse and validate query parameters (ONE-LINER!)
    const filters = parseSearchParams(
      req.nextUrl.searchParams,
      reviewFiltersSchema
    );

    // Execute query through controller
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

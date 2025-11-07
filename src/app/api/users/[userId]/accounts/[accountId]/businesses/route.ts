import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { BusinessesController } from "@/lib/controllers";
import {
  parseSearchParams,
  businessFiltersSchema,
} from "@/lib/utils/query-parser";
import type { BusinessCreate } from "@/lib/types";
import { checkBusinessLimit } from "@/lib/firebase/business-limits";
import { getDefaultBusinessConfig } from "@/lib/firebase/business-config";

/**
 * GET /api/users/[userId]/accounts/[accountId]/businesses
 * List businesses with optional filtering
 *
 * Query parameters:
 * - ids: string[] - Filter by specific business IDs
 * - connected: boolean - Filter by connection status
 * - limit: number - Maximum number of businesses to return
 * - offset: number - Number of businesses to skip
 * - orderBy: BusinessSortField - Field to sort by (connectedAt, name)
 * - orderDirection: 'asc' | 'desc' - Sort direction
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; accountId: string }> }
) {
  try {
    const { userId: authenticatedUserId } = await getAuthenticatedUserId();
    const { userId, accountId } = await params;

    if (authenticatedUserId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot access another user's data" },
        { status: 403 }
      );
    }

    // Parse filters (ONE-LINER!)
    const filters = parseSearchParams(
      req.nextUrl.searchParams,
      businessFiltersSchema
    );

    const controller = new BusinessesController(userId, accountId);
    const businesses = await controller.getBusinesses(filters);

    return NextResponse.json({
      businesses,
      count: businesses.length,
    });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch businesses",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/[userId]/accounts/[accountId]/businesses
 * Create a new business
 *
 * Body: Partial<BusinessCreate> with required fields:
 * - googleBusinessId: string
 * - name: string
 * - address: string
 * - config?: Partial<BusinessConfig>
 * - emailOnNewReview?: boolean
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; accountId: string }> }
) {
  try {
    const { userId: authenticatedUserId } = await getAuthenticatedUserId();
    const { userId, accountId } = await params;

    if (authenticatedUserId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot access another user's data" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Check business limit (subscription-based)
    const canCreate = await checkBusinessLimit(userId);
    if (!canCreate) {
      return NextResponse.json(
        {
          error:
            "הגעת למגבלת העסקים בתוכנית הנוכחית. שדרג את התוכנית כדי להוסיף עסקים נוספים.",
        },
        { status: 403 }
      );
    }

    // Merge default config with provided config
    const defaultConfig = getDefaultBusinessConfig();
    const businessConfig = {
      ...defaultConfig,
      ...body.config,
      name: body.config?.name || body.name,
      description: body.config?.description || body.description || "",
      phoneNumber: body.config?.phoneNumber || body.phoneNumber || "",
    };

    const businessData: BusinessCreate = {
      userId,
      accountId,
      googleBusinessId: body.googleBusinessId,
      name: body.name,
      address: body.address,
      phoneNumber: body.phoneNumber || null,
      websiteUrl: body.websiteUrl || null,
      mapsUrl: body.mapsUrl || null,
      description: body.description || null,
      photoUrl: body.photoUrl || null,
      emailOnNewReview: body.emailOnNewReview ?? true,
      config: businessConfig,
    };

    const controller = new BusinessesController(userId, accountId);
    const business = await controller.createBusiness(businessData);

    return NextResponse.json({ business }, { status: 201 });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create business",
      },
      { status: 500 }
    );
  }
}

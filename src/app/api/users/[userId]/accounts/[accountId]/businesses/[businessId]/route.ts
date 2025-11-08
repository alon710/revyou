import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { BusinessesController } from "@/lib/controllers";
import { getErrorStatusCode } from "@/lib/api/errors";

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

    const controller = new BusinessesController(userId, accountId);
    const business = await controller.getBusiness(businessId);

    return NextResponse.json({ business });
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch business",
      },
      { status: getErrorStatusCode(error) }
    );
  }
}

export async function DELETE(
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

    const controller = new BusinessesController(userId, accountId);
    await controller.deleteBusiness(businessId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting business:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete business",
      },
      { status: getErrorStatusCode(error) }
    );
  }
}

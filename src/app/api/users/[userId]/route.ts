import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { getErrorStatusCode } from "@/lib/api/errors";
import { UsersController } from "@/lib/controllers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId: authenticatedUserId } = await getAuthenticatedUserId();
    const { userId } = await params;

    if (authenticatedUserId !== userId) {
      return NextResponse.json({ error: "Forbidden: Cannot access another user's data" }, { status: 403 });
    }

    const controller = new UsersController();
    const user = await controller.getUser(userId);

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    const statusCode = getErrorStatusCode(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch user",
      },
      { status: statusCode }
    );
  }
}

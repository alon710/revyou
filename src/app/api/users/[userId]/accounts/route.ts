import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { AccountsController } from "@/lib/controllers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId: authenticatedUserId } = await getAuthenticatedUserId();
    const { userId } = await params;

    if (authenticatedUserId !== userId) {
      return NextResponse.json({ error: "Forbidden: Cannot access another user's data" }, { status: 403 });
    }

    const controller = new AccountsController(userId);
    const accounts = await controller.getAccounts();

    return NextResponse.json({
      accounts,
      count: accounts.length,
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch accounts",
      },
      { status: 500 }
    );
  }
}

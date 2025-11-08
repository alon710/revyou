import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { AccountsController } from "@/lib/controllers";
import type { AccountUpdate } from "@/lib/types";
import { getErrorStatusCode } from "@/lib/api/errors";

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

    const controller = new AccountsController(userId);
    const account = await controller.getAccount(accountId);

    return NextResponse.json({ account });
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch account",
      },
      { status: getErrorStatusCode(error) }
    );
  }
}

export async function PUT(
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

    const body: AccountUpdate = await req.json();

    const controller = new AccountsController(userId);
    const account = await controller.updateAccount(accountId, body);

    return NextResponse.json({ account });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update account",
      },
      { status: getErrorStatusCode(error) }
    );
  }
}

export async function DELETE(
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

    const controller = new AccountsController(userId);
    await controller.deleteAccount(accountId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete account",
      },
      { status: getErrorStatusCode(error) }
    );
  }
}

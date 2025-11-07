import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { AccountsController } from "@/lib/controllers";
import {
  parseSearchParams,
  accountFiltersSchema,
} from "@/lib/utils/query-parser";
import type { AccountCreate } from "@/lib/types";

/**
 * GET /api/users/[userId]/accounts
 * List accounts with optional filtering
 *
 * Query parameters:
 * - ids: string[] - Filter by specific account IDs
 * - email: string - Filter by email address
 * - limit: number - Maximum number of accounts to return
 * - offset: number - Number of accounts to skip
 * - orderBy: AccountSortField - Field to sort by (connectedAt, email)
 * - orderDirection: 'asc' | 'desc' - Sort direction
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: authenticatedUserId } = await getAuthenticatedUserId();
    const { userId } = await params;

    if (authenticatedUserId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot access another user's data" },
        { status: 403 }
      );
    }

    // Parse filters (ONE-LINER!)
    const filters = parseSearchParams(
      req.nextUrl.searchParams,
      accountFiltersSchema
    );

    const controller = new AccountsController(userId);
    const accounts = await controller.getAccounts(filters);

    return NextResponse.json({
      accounts,
      count: accounts.length,
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch accounts",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/[userId]/accounts
 * Create a new account (typically during OAuth flow)
 *
 * Body: AccountCreate (without userId - will be added from params)
 * - email: string
 * - accountName: string
 * - googleRefreshToken: string
 * - googleAccountName?: string
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: authenticatedUserId } = await getAuthenticatedUserId();
    const { userId } = await params;

    if (authenticatedUserId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot access another user's data" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const accountData: AccountCreate = {
      userId,
      email: body.email,
      accountName: body.accountName,
      googleRefreshToken: body.googleRefreshToken,
      googleAccountName: body.googleAccountName,
    };

    const controller = new AccountsController(userId);
    const account = await controller.createAccount(accountData);

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create account",
      },
      { status: 500 }
    );
  }
}

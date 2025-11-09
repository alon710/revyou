import { NextResponse } from "next/server";
import { AccountsController } from "@/lib/controllers";
import { listAllBusinesses, decryptToken } from "@/lib/google/business-profile";
import { getAuthenticatedUserId } from "@/lib/api/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const authResult = await getAuthenticatedUserId();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId: authenticatedUserId } = authResult;

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const accountsController = new AccountsController(authenticatedUserId);
    const account = await accountsController.getAccount(accountId);

    if (!account.googleRefreshToken) {
      return NextResponse.json({ error: "לא נמצא חיבור ל-Google Business Profile" }, { status: 404 });
    }

    const refreshToken = await decryptToken(account.googleRefreshToken);
    const businesses = await listAllBusinesses(refreshToken);

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error("Error fetching businesses:", error);

    return NextResponse.json({ error: "לא ניתן לטעון עסקים מ-Google Business Profile" }, { status: 500 });
  }
}

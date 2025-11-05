import { NextResponse } from "next/server";
import {
  getAccountGoogleRefreshToken,
  getUserSelectedAccountId,
} from "@/lib/firebase/admin-accounts";
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
    let accountId = searchParams.get("accountId");

    if (!accountId) {
      accountId = await getUserSelectedAccountId(authenticatedUserId);
    }

    if (!accountId) {
      return NextResponse.json(
        { error: "לא נמצא חשבון פעיל. אנא התחבר מחדש." },
        { status: 404 }
      );
    }

    const encryptedRefreshToken = await getAccountGoogleRefreshToken(
      authenticatedUserId,
      accountId
    );

    if (!encryptedRefreshToken) {
      return NextResponse.json(
        { error: "לא נמצא חיבור ל-Google Business Profile" },
        { status: 404 }
      );
    }

    const refreshToken = await decryptToken(encryptedRefreshToken);
    const businesses = await listAllBusinesses(refreshToken);

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error("Error fetching businesses:", error);

    return NextResponse.json(
      { error: "לא ניתן לטעון עסקים מ-Google Business Profile" },
      { status: 500 }
    );
  }
}

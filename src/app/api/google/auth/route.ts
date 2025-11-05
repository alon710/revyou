import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/google/oauth";
import { getAuthenticatedUserId } from "@/lib/api/auth";

export async function GET(request: Request) {
  try {
    const authResult = await getAuthenticatedUserId();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId } = authResult;

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const reconnect = accountId !== null;

    const state = Buffer.from(
      JSON.stringify({
        userId,
        reconnect,
        accountId: accountId || null,
      })
    ).toString("base64");

    const authUrl = getAuthorizationUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error initiating OAuth flow:", error);
    return NextResponse.json(
      { error: "לא ניתן להתחיל את תהליך ההזדהות" },
      { status: 500 }
    );
  }
}

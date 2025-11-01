import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/google/oauth";
import { getAuthenticatedUserId } from "@/lib/api/auth";

export async function GET() {
  try {
    const authResult = await getAuthenticatedUserId();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId } = authResult;

    const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

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

import { NextRequest, NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/google/oauth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "חסר מזהה משתמש" }, { status: 400 });
    }

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

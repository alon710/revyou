import { NextRequest, NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/google/oauth";

/**
 * GET /api/google/auth
 * Initiates Google OAuth flow for Business Profile API
 * Redirects user to Google consent screen
 */
export async function GET(request: NextRequest) {
  try {
    // Get the user ID from query params (passed from frontend)
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "חסר מזהה משתמש" }, { status: 400 });
    }

    // Generate state parameter for CSRF protection
    // Store userId in state to retrieve it in callback
    const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

    // Get authorization URL
    const authUrl = getAuthorizationUrl(state);

    // Redirect to Google OAuth consent screen
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error initiating OAuth flow:", error);
    return NextResponse.json(
      { error: "לא ניתן להתחיל את תהליך ההזדהות" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, encryptToken } from "@/lib/google/oauth";
import { updateUserGoogleRefreshToken } from "@/lib/firebase/users";

/**
 * GET /api/google/callback
 * Handles OAuth callback from Google
 * Exchanges authorization code for tokens and stores refresh token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle user cancellation or errors
    if (error) {
      const errorMessage = error === "access_denied"
        ? "המשתמש ביטל את ההזדהות"
        : "שגיאה בתהליך ההזדהות";

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/businesses?error=${encodeURIComponent(errorMessage)}`
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/businesses?error=${encodeURIComponent("פרמטרים חסרים")}`
      );
    }

    // Parse state to get userId
    let userId: string;
    try {
      const stateData = JSON.parse(Buffer.from(state, "base64").toString());
      userId = stateData.userId;
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/businesses?error=${encodeURIComponent("מצב לא תקין")}`
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/businesses?error=${encodeURIComponent("לא התקבל אסימון רענון")}`
      );
    }

    // Encrypt and store refresh token
    const encryptedToken = encryptToken(tokens.refresh_token);
    await updateUserGoogleRefreshToken(userId, encryptedToken);

    // Redirect to business selection page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/businesses/connect?success=true`
    );
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/businesses?error=${encodeURIComponent("שגיאה בשמירת ההזדהות")}`
    );
  }
}

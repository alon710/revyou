import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, encryptToken } from "@/lib/google/oauth";
import { updateUserGoogleRefreshToken } from "@/lib/firebase/admin-users";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      const errorMessage =
        error === "access_denied"
          ? "המשתמש ביטל את ההזדהות"
          : "שגיאה בתהליך ההזדהות";

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/locations?error=${encodeURIComponent(errorMessage)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/locations?error=${encodeURIComponent("פרמטרים חסרים")}`
      );
    }

    let userId: string;
    try {
      const stateData = JSON.parse(Buffer.from(state, "base64").toString());
      userId = stateData.userId;
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/locations?error=${encodeURIComponent("מצב לא תקין")}`
      );
    }

    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/locations?error=${encodeURIComponent("לא התקבל אסימון רענון")}`
      );
    }

    const encryptedToken = encryptToken(tokens.refresh_token);
    await updateUserGoogleRefreshToken(userId, encryptedToken);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/locations/connect?success=true`
    );
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/locations?error=${encodeURIComponent("שגיאה בשמירת ההזדהות")}`
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, encryptToken } from "@/lib/google/oauth";
import { updateUserGoogleRefreshToken } from "@/lib/firebase/admin-users";

export const runtime = "nodejs";

const redirectToLocations = (success = false) => {
  const url = success
    ? `${process.env.NEXT_PUBLIC_APP_URL}/locations/connect?success=true`
    : `${process.env.NEXT_PUBLIC_APP_URL}/locations`;
  return NextResponse.redirect(url);
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error || !code || !state) {
      return redirectToLocations();
    }

    const stateData = JSON.parse(Buffer.from(state, "base64").toString());
    const userId = stateData?.userId;

    if (!userId) {
      return redirectToLocations();
    }

    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      return redirectToLocations();
    }

    const encryptedToken = encryptToken(tokens.refresh_token);
    await updateUserGoogleRefreshToken(userId, encryptedToken);

    return redirectToLocations(true);
  } catch (error) {
    console.error("Error in OAuth callback", error);
    return redirectToLocations();
  }
}

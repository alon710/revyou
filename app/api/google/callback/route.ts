import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, encryptToken } from "@/lib/google/oauth";
import { updateUserGoogleRefreshToken } from "@/lib/firebase/admin-users";
import { getAuthenticatedUserId } from "@/lib/api/auth";

export const runtime = "nodejs";

const redirectToLocations = () => {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/locations`;
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
    const stateUserId = stateData?.userId;

    if (!stateUserId) {
      return redirectToLocations();
    }

    const authResult = await getAuthenticatedUserId();
    if (authResult instanceof NextResponse) {
      return redirectToLocations();
    }

    const { userId: authenticatedUserId } = authResult;

    if (stateUserId !== authenticatedUserId) {
      console.error("State userId mismatch with authenticated user");
      return redirectToLocations();
    }

    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      return redirectToLocations();
    }

    const encryptedToken = await encryptToken(tokens.refresh_token);
    await updateUserGoogleRefreshToken(authenticatedUserId, encryptedToken);

    return redirectToLocations();
  } catch (error) {
    console.error("Error in OAuth callback", error);
    return redirectToLocations();
  }
}

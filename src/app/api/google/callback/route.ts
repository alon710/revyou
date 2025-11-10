import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, encryptToken, getUserInfo } from "@/lib/google/oauth";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { AccountsController, UsersController } from "@/lib/controllers";

export const runtime = "nodejs";

const redirectToBusinesses = (success?: boolean, accountId?: string) => {
  if (success && accountId) {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/choose-business?accountId=${accountId}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/onboarding/connect-account`);
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error || !code || !state) {
      console.error("OAuth callback - Missing parameters or error from Google:", {
        error,
        hasCode: !!code,
        hasState: !!state,
      });
      return redirectToBusinesses(false);
    }

    const stateData = JSON.parse(Buffer.from(state, "base64").toString());
    const stateUserId = stateData?.userId;
    const reconnect = stateData?.reconnect || false;
    const existingAccountId = stateData?.accountId;

    if (!stateUserId) {
      console.error("OAuth callback - Invalid state: missing userId");
      return redirectToBusinesses(false);
    }

    const authResult = await getAuthenticatedUserId();
    if (authResult instanceof NextResponse) {
      console.error("OAuth callback - User not authenticated");
      return redirectToBusinesses(false);
    }

    const { userId: authenticatedUserId } = authResult;

    if (stateUserId !== authenticatedUserId) {
      console.error("OAuth callback - State userId mismatch:", {
        stateUserId,
        authenticatedUserId,
      });
      return redirectToBusinesses(false);
    }

    console.error("[Callback Debug] About to exchange code for tokens");
    console.error(`[Callback Debug] Code received (first 15 chars): ${code.substring(0, 15)}...`);
    console.error(`[Callback Debug] Code length: ${code.length}`);

    const tokens = await exchangeCodeForTokens(code);

    console.error("[Callback Debug] Token exchange completed");
    console.error(`[Callback Debug] Has refresh token: ${!!tokens.refresh_token}`);
    console.error(`[Callback Debug] Has access token: ${!!tokens.access_token}`);

    if (!tokens.refresh_token) {
      console.error("OAuth callback - No refresh token received from Google");
      return redirectToBusinesses(false);
    }

    if (!tokens.access_token) {
      console.error("OAuth callback - No access token received from Google");
      return redirectToBusinesses(false);
    }

    const encryptedToken = await encryptToken(tokens.refresh_token);

    const usersController = new UsersController();
    const accountsController = new AccountsController(authenticatedUserId);

    let accountId: string;

    if (reconnect && existingAccountId) {
      await accountsController.updateAccount(existingAccountId, {
        googleRefreshToken: encryptedToken,
      });
      accountId = existingAccountId;
    } else {
      const userInfo = await getUserInfo(tokens.access_token);

      await usersController.getUser(authenticatedUserId);

      const existingAccount = await accountsController.findByEmail(userInfo.email);

      if (existingAccount) {
        await accountsController.updateAccount(existingAccount.id, {
          googleRefreshToken: encryptedToken,
        });
        accountId = existingAccount.id;
      } else {
        const newAccount = await accountsController.createAccount({
          userId: authenticatedUserId,
          email: userInfo.email,
          accountName: userInfo.name,
          googleRefreshToken: encryptedToken,
        });
        accountId = newAccount.id;
      }
    }

    return redirectToBusinesses(true, accountId);
  } catch (error) {
    console.error("=== OAuth Callback Error ===");
    console.error("Error message:", error instanceof Error ? error.message : error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    console.error("Error details:", JSON.stringify(error, null, 2));
    console.error("[Callback Debug] Environment configuration:");
    console.error(`[Callback Debug] NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
    console.error(`[Callback Debug] GOOGLE_CLIENT_ID exists: ${!!process.env.GOOGLE_CLIENT_ID}`);
    console.error(`[Callback Debug] GOOGLE_CLIENT_SECRET exists: ${!!process.env.GOOGLE_CLIENT_SECRET}`);
    console.error(`[Callback Debug] Expected redirect URI: ${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`);
    console.error("===========================");

    return redirectToBusinesses(false);
  }
}

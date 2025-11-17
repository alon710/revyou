import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, encryptToken, getUserInfo } from "@/lib/google/oauth";
import { getAuthenticatedUserId, createLocaleAwareRedirect } from "@/lib/api/auth";
import { AccountsController, UsersController } from "@/lib/controllers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const redirectToBusinesses = (request: NextRequest, success?: boolean, accountId?: string) => {
  if (success && accountId) {
    return createLocaleAwareRedirect(request, "/onboarding/choose-business", { accountId });
  }

  return createLocaleAwareRedirect(request, "/onboarding/connect-account");
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
      return redirectToBusinesses(request, false, undefined);
    }

    const stateData = JSON.parse(Buffer.from(state, "base64").toString());
    const stateUserId = stateData?.userId;
    const reconnect = stateData?.reconnect || false;
    const existingAccountId = stateData?.accountId;

    if (!stateUserId) {
      console.error("OAuth callback - Invalid state: missing userId");
      return redirectToBusinesses(request, false, undefined);
    }

    const authResult = await getAuthenticatedUserId();
    if (authResult instanceof NextResponse) {
      console.error("OAuth callback - User not authenticated");
      return redirectToBusinesses(request, false, undefined);
    }

    const { userId: authenticatedUserId } = authResult;

    if (stateUserId !== authenticatedUserId) {
      console.error("OAuth callback - State userId mismatch:", {
        stateUserId,
        authenticatedUserId,
      });
      return redirectToBusinesses(request, false, undefined);
    }

    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      console.error("OAuth callback - No refresh token received from Google");
      return redirectToBusinesses(request, false, undefined);
    }

    if (!tokens.access_token) {
      console.error("OAuth callback - No access token received from Google");
      return redirectToBusinesses(request, false, undefined);
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

      // Ensure user config exists (will create if doesn't exist)
      await usersController.getUserConfig(authenticatedUserId);

      const existingAccount = await accountsController.findByEmail(userInfo.email);

      if (existingAccount) {
        await accountsController.updateAccount(existingAccount.id, {
          googleRefreshToken: encryptedToken,
        });
        accountId = existingAccount.id;
      } else {
        const newAccount = await accountsController.createAccount({
          email: userInfo.email,
          accountName: userInfo.name,
          googleRefreshToken: encryptedToken,
        });
        accountId = newAccount.id;
      }
    }

    return redirectToBusinesses(request, true, accountId);
  } catch (error) {
    console.error("OAuth callback - Error:", error);
    return redirectToBusinesses(request, false, undefined);
  }
}

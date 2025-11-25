import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, encryptToken, getUserInfo } from "@/lib/google/oauth";
import { getAuthenticatedUserId, createLocaleAwareRedirect } from "@/lib/api/auth";
import { AccountsController, UsersController } from "@/lib/controllers";
import { resolveLocale } from "@/lib/locale-detection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const redirectToBusinesses = async (success?: boolean, accountId?: string, userId?: string) => {
  if (success && accountId) {
    return await createLocaleAwareRedirect("/onboarding/choose-business", { accountId }, userId);
  }

  return await createLocaleAwareRedirect("/onboarding/connect-account", undefined, userId);
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
      return redirectToBusinesses(false, undefined);
    }

    const stateData = JSON.parse(Buffer.from(state, "base64").toString());
    const stateUserId = stateData?.userId;
    const reconnect = stateData?.reconnect || false;
    const existingAccountId = stateData?.accountId;

    if (!stateUserId) {
      console.error("OAuth callback - Invalid state: missing userId");
      return redirectToBusinesses(false, undefined);
    }

    const authResult = await getAuthenticatedUserId();
    if (authResult instanceof NextResponse) {
      console.error("OAuth callback - User not authenticated");
      return redirectToBusinesses(false, undefined);
    }

    const { userId: authenticatedUserId } = authResult;

    if (stateUserId !== authenticatedUserId) {
      console.error("OAuth callback - State userId mismatch:", {
        stateUserId,
        authenticatedUserId,
      });
      return redirectToBusinesses(false, undefined);
    }

    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      console.error("OAuth callback - No refresh token received from Google");
      return redirectToBusinesses(false, undefined);
    }

    if (!tokens.access_token) {
      console.error("OAuth callback - No access token received from Google");
      return redirectToBusinesses(false, undefined);
    }

    const encryptedToken = await encryptToken(tokens.refresh_token);

    const usersController = new UsersController();
    const accountsController = new AccountsController(authenticatedUserId);

    let accountId: string;

    if (reconnect && existingAccountId) {
      await accountsController.updateAccount(existingAccountId, {
        googleRefreshToken: encryptedToken,
        lastSynced: new Date(),
      });
      accountId = existingAccountId;
    } else {
      const userInfo = await getUserInfo(tokens.access_token);

      const detectedLocale = await resolveLocale();
      await usersController.getUserConfig(authenticatedUserId, detectedLocale);

      const existingAccount = await accountsController.findByEmail(userInfo.email);

      if (existingAccount) {
        await accountsController.updateAccount(existingAccount.id, {
          googleRefreshToken: encryptedToken,
          lastSynced: new Date(),
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

    return redirectToBusinesses(true, accountId, authenticatedUserId);
  } catch (error) {
    console.error("OAuth callback - Error:", error);
    return redirectToBusinesses(false, undefined);
  }
}

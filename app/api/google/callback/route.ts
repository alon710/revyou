import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  encryptToken,
  getUserInfo,
} from "@/lib/google/oauth";
import { updateUserSelectedAccount } from "@/lib/firebase/admin-users";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { createAccount, updateAccount } from "@/lib/firebase/admin-accounts";

export const runtime = "nodejs";

const redirectToBusinesses = (
  success?: boolean,
  errorMessage?: string,
  accountId?: string
) => {
  const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/businesses/connect`;
  let url = baseUrl;

  if (success === true) {
    url = accountId
      ? `${baseUrl}?success=true&accountId=${accountId}`
      : `${baseUrl}?success=true`;
  } else if (errorMessage) {
    url = `${baseUrl}?error=${encodeURIComponent(errorMessage)}`;
  }

  return NextResponse.redirect(url);
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error || !code || !state) {
      return redirectToBusinesses(
        false,
        "אירעה שגיאה באימות Google. אנא נסה שוב."
      );
    }

    const stateData = JSON.parse(Buffer.from(state, "base64").toString());
    const stateUserId = stateData?.userId;
    const reconnect = stateData?.reconnect || false;
    const existingAccountId = stateData?.accountId;

    if (!stateUserId) {
      return redirectToBusinesses(false, "מזהה משתמש לא תקין. אנא נסה שוב.");
    }

    const authResult = await getAuthenticatedUserId();
    if (authResult instanceof NextResponse) {
      return redirectToBusinesses(
        false,
        "לא מחובר למערכת. אנא התחבר ונסה שוב."
      );
    }

    const { userId: authenticatedUserId } = authResult;

    if (stateUserId !== authenticatedUserId) {
      console.error("State userId mismatch with authenticated user");
      return redirectToBusinesses(
        false,
        "חוסר התאמה במזהה משתמש. אנא נסה שוב."
      );
    }

    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      return redirectToBusinesses(
        false,
        "לא התקבל אסימון רענון מ-Google. אנא נסה שוב."
      );
    }

    if (!tokens.access_token) {
      return redirectToBusinesses(
        false,
        "לא התקבל אסימון גישה מ-Google. אנא נסה שוב."
      );
    }

    const encryptedToken = await encryptToken(tokens.refresh_token);

    let accountId: string;

    if (reconnect && existingAccountId) {
      await updateAccount(authenticatedUserId, existingAccountId, {
        googleRefreshToken: encryptedToken,
      });
      accountId = existingAccountId;
    } else {
      const userInfo = await getUserInfo(tokens.access_token);

      accountId = await createAccount(authenticatedUserId, {
        email: userInfo.email,
        accountName: userInfo.name,
        googleRefreshToken: encryptedToken,
      });

      await updateUserSelectedAccount(authenticatedUserId, accountId);
    }

    return redirectToBusinesses(true, undefined, accountId);
  } catch (error) {
    console.error("Error in OAuth callback", error);
    return redirectToBusinesses(
      false,
      "אירעה שגיאה בחיבור ל-Google. אנא נסה שוב."
    );
  }
}

import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/google/oauth";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  try {
    const authResult = await getAuthenticatedUserId();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId } = authResult;

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const onboarding = searchParams.get("onboarding") === "true";
    const reconnect = accountId !== null;

    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userEmail = userDoc.data()?.email;

    const state = Buffer.from(
      JSON.stringify({
        userId,
        reconnect,
        accountId: accountId || null,
        onboarding,
      })
    ).toString("base64");

    const authUrl = getAuthorizationUrl(state, userEmail);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error initiating OAuth flow:", error);
    return NextResponse.json(
      { error: "לא ניתן להתחיל את תהליך ההזדהות" },
      { status: 500 }
    );
  }
}

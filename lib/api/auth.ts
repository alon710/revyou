import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "session";

export async function getAuthenticatedUserId(): Promise<
  { userId: string } | NextResponse
> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie.value,
      true
    );

    return { userId: decodedClaims.uid };
  } catch (error) {
    console.error("Error verifying session cookie:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

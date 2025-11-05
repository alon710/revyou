import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "session";

export async function getAuthenticatedUserId(): Promise<{ userId: string }> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) {
      throw new Error("Session cookie not found");
    }

    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie.value,
      true
    );

    return { userId: decodedClaims.uid };
  } catch (error) {
    console.error(
      "Error verifying session cookie:",
      error instanceof Error ? error.message : "Unknown authentication error"
    );

    throw new Error("Failed to authenticate user");
  }
}

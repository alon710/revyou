import { NextResponse } from "next/server";
import { getUserGoogleRefreshToken } from "@/lib/firebase/admin-users";
import { listAllLocations, decryptToken } from "@/lib/google/business-profile";
import { getAuthenticatedUserId } from "@/lib/api/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const authResult = await getAuthenticatedUserId();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId: authenticatedUserId } = authResult;

    const encryptedRefreshToken =
      await getUserGoogleRefreshToken(authenticatedUserId);

    if (!encryptedRefreshToken) {
      return NextResponse.json(
        { error: "לא נמצא חיבור ל-Google Business Profile" },
        { status: 404 }
      );
    }

    const refreshToken = decryptToken(encryptedRefreshToken);
    const locations = await listAllLocations(refreshToken);

    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Error fetching locations:", error);

    if (error instanceof Error) {
      if (error.message.includes("quota") || error.message.includes("429")) {
        return NextResponse.json(
          { error: "Google מגביל את מספר הבקשות. נא להמתין דקה ולנסות שוב." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "לא ניתן לטעון מיקומים מ-Google Business Profile" },
      { status: 500 }
    );
  }
}

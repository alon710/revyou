import { NextRequest, NextResponse } from "next/server";
import { getUserGoogleRefreshToken } from "@/lib/firebase/admin-users";
import { listAllLocations, decryptToken } from "@/lib/google/business-profile";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const encryptedRefreshToken = await getUserGoogleRefreshToken(userId);

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

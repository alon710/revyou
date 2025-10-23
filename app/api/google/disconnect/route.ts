import { NextRequest, NextResponse } from "next/server";
import { getUser, removeUserGoogleRefreshToken } from "@/lib/firebase/admin-users";
import { decryptToken, revokeToken } from "@/lib/google/oauth";

/**
 * POST /api/google/disconnect
 * Revokes Google OAuth tokens and removes refresh token from user
 * Requires userId in request body
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "חסר מזהה משתמש" },
        { status: 400 }
      );
    }

    // Get user data
    const user = await getUser(userId);
    if (!user) {
      return NextResponse.json(
        { error: "משתמש לא נמצא" },
        { status: 404 }
      );
    }

    // If user has a refresh token, revoke it
    if (user.googleRefreshToken) {
      try {
        const refreshToken = decryptToken(user.googleRefreshToken);
        await revokeToken(refreshToken);
      } catch (error) {
        console.error("Error revoking token:", error);
        // Continue even if revocation fails
      }
    }

    // Remove refresh token from user document
    await removeUserGoogleRefreshToken(userId);

    return NextResponse.json({
      success: true,
      message: "ההתחברות ל-Google נותקה בהצלחה",
    });
  } catch (error) {
    console.error("Error disconnecting Google account:", error);
    return NextResponse.json(
      { error: "לא ניתן לנתק את חשבון Google" },
      { status: 500 }
    );
  }
}

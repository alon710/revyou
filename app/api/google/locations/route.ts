import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/firebase/admin-users";
import { decryptToken } from "@/lib/google/oauth";
import {
  getAllLocations,
  formatAddress,
  extractLocationId,
  extractAccountId,
} from "@/lib/google/business-profile";

/**
 * GET /api/google/locations
 * Fetch all Google Business locations for the authenticated user
 * Requires userId query parameter
 */
export async function GET(request: NextRequest) {
  try {
    // Get userId from query params
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "חסר מזהה משתמש" }, { status: 400 });
    }

    // Get user data to retrieve refresh token
    const user = await getUser(userId);
    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    if (!user.googleRefreshToken) {
      return NextResponse.json(
        { error: "לא נמצא אסימון Google. נא להתחבר מחדש." },
        { status: 401 }
      );
    }

    // Decrypt refresh token
    const refreshToken = decryptToken(user.googleRefreshToken);

    // Fetch locations from Google
    const locations = await getAllLocations(refreshToken);

    // Format locations for frontend
    const formattedLocations = locations.map((loc) => ({
      id: extractLocationId(loc.name),
      name: loc.title,
      address: formatAddress(loc),
      accountId: extractAccountId(loc.accountId),
      accountName: loc.accountName,
      resourceName: loc.name,
      phone: loc.primaryPhone,
      website: loc.websiteUri,
    }));

    return NextResponse.json({ locations: formattedLocations });
  } catch (error) {
    console.error("Error fetching locations:", error);

    // Extract error message and determine appropriate status code
    const errorMessage =
      error instanceof Error ? error.message : "לא ניתן לטעון את המיקומים";

    // Check if it's a rate limit error
    let statusCode = 500;
    if (
      errorMessage.includes("מגביל את מספר הבקשות") ||
      errorMessage.includes("rate limit")
    ) {
      statusCode = 429;
    } else if (
      errorMessage.includes("חסרות הרשאות") ||
      errorMessage.includes("permission")
    ) {
      statusCode = 403;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

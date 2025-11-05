import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { adminDb } from "@/lib/firebase/admin";
import { revokeGoogleRefreshToken } from "@/lib/google/oauth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    // Authenticate user
    const { userId } = await getAuthenticatedUserId();
    const { accountId } = await params;

    // Get account to retrieve refresh token
    const accountRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("accounts")
      .doc(accountId);

    const accountDoc = await accountRef.get();

    if (!accountDoc.exists) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    const accountData = accountDoc.data();

    // Revoke Google OAuth token before deletion
    if (accountData?.googleRefreshToken) {
      try {
        await revokeGoogleRefreshToken(accountData.googleRefreshToken);
      } catch (error) {
        console.error("Failed to revoke Google OAuth token:", error);
        // Continue with deletion even if revocation fails
      }
    }

    // Get all businesses under this account
    const businessesRef = accountRef.collection("businesses");
    const businessesSnapshot = await businessesRef.get();

    const batch = adminDb.batch();

    // Delete all businesses and their reviews
    for (const businessDoc of businessesSnapshot.docs) {
      const reviewsRef = businessDoc.ref.collection("reviews");
      const reviewsSnapshot = await reviewsRef.get();

      // Delete all reviews
      reviewsSnapshot.docs.forEach((reviewDoc) => {
        batch.delete(reviewDoc.ref);
      });

      // Delete business
      batch.delete(businessDoc.ref);
    }

    // Delete account
    batch.delete(accountRef);

    // Commit all deletions
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);

    if (error instanceof Error && error.message.includes("authenticate")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}

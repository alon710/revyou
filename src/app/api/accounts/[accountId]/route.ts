import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { adminDb } from "@/lib/firebase/admin";
import { revokeGoogleRefreshToken } from "@/lib/google/oauth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { userId } = await getAuthenticatedUserId();
    const { accountId } = await params;

    const accountRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("accounts")
      .doc(accountId);

    const accountDoc = await accountRef.get();

    if (!accountDoc.exists) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const accountData = accountDoc.data();

    if (accountData?.googleRefreshToken) {
      try {
        await revokeGoogleRefreshToken(accountData.googleRefreshToken);
      } catch (error) {
        console.error("Failed to revoke Google OAuth token:", error);
      }
    }

    const businessesRef = accountRef.collection("businesses");
    const businessesSnapshot = await businessesRef.get();

    const batch = adminDb.batch();

    for (const businessDoc of businessesSnapshot.docs) {
      const reviewsRef = businessDoc.ref.collection("reviews");
      const reviewsSnapshot = await reviewsRef.get();

      reviewsSnapshot.docs.forEach((reviewDoc) => {
        batch.delete(reviewDoc.ref);
      });

      batch.delete(businessDoc.ref);
    }

    batch.delete(accountRef);

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

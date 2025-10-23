import { adminDb } from "./admin";
import { User } from "@/types/database";

/**
 * Admin User Database Operations
 * Server-side operations using Firebase Admin SDK
 * These bypass Firestore security rules and should only be used in API routes
 */

/**
 * Get a user by their UID (Admin SDK - bypasses security rules)
 * This should only be called from server-side API routes
 * @param uid - User ID
 * @returns User data or null if not found
 */
export async function getUser(uid: string): Promise<User | null> {
  try {
    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return null;
    }

    const data = userDoc.data();
    if (!data) {
      return null;
    }

    // Convert Firestore Timestamp to Date for compatibility
    return {
      uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      createdAt: data.createdAt,
      subscriptionTier: data.subscriptionTier,
      stripeCustomerId: data.stripeCustomerId,
      googleRefreshToken: data.googleRefreshToken,
    } as User;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("לא ניתן לטעון את פרטי המשתמש");
  }
}

/**
 * Update user's Google refresh token (Admin SDK - bypasses security rules)
 * This should only be called from server-side API routes
 * @param uid - User ID
 * @param googleRefreshToken - Encrypted Google refresh token
 */
export async function updateUserGoogleRefreshToken(
  uid: string,
  googleRefreshToken: string
): Promise<void> {
  try {
    const userRef = adminDb.collection("users").doc(uid);
    await userRef.update({
      googleRefreshToken,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating Google refresh token:", error);
    throw new Error("לא ניתן לעדכן את חיבור Google");
  }
}

/**
 * Remove user's Google refresh token (Admin SDK - bypasses security rules)
 * @param uid - User ID
 */
export async function removeUserGoogleRefreshToken(uid: string): Promise<void> {
  try {
    const userRef = adminDb.collection("users").doc(uid);
    await userRef.update({
      googleRefreshToken: null,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error removing Google refresh token:", error);
    throw new Error("לא ניתן להסיר את חיבור Google");
  }
}

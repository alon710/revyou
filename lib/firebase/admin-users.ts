import { adminDb } from "@/lib/firebase/admin";
import { User } from "@/types/database";

export async function getUserAdmin(uid: string): Promise<User | null> {
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

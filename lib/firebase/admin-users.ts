import { adminDb } from "@/lib/firebase/admin";

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

export async function getUserGoogleRefreshToken(
  uid: string
): Promise<string | null> {
  try {
    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return null;
    }

    const data = userDoc.data();
    return data?.googleRefreshToken || null;
  } catch (error) {
    console.error("Error getting Google refresh token:", error);
    throw new Error("לא ניתן לטעון את חיבור Google");
  }
}

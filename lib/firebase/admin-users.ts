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

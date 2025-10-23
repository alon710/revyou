import { adminDb } from "./admin";
import { User } from "@/types/database";
import { userSchemaAdmin } from "@/lib/validation/database.admin";

/**
 * ADMIN SDK FUNCTIONS FOR USERS
 * These functions use Firebase Admin SDK and should ONLY be called from server-side code (API routes, server actions)
 * They bypass Firestore security rules and have elevated privileges
 */

/**
 * Get a user by their UID (Admin SDK version)
 * @param uid - User ID
 * @returns User data or null if not found
 */
export async function getUserAdmin(uid: string): Promise<User | null> {
  try {
    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      const data = userSnap.data();
      // Validate data before returning
      const validated = userSchemaAdmin.parse({ uid, ...data });
      return validated as User;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user (admin):", error);
    throw new Error("לא ניתן לטעון את פרטי המשתמש");
  }
}

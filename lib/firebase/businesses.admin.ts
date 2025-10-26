import { adminDb } from "./admin";
import { Business } from "@/types/database";
import { businessSchemaAdmin } from "@/lib/validation/database.admin";

/**
 * ADMIN SDK FUNCTIONS FOR BUSINESSES
 * These functions use Firebase Admin SDK and should ONLY be called from server-side code (API routes, server actions)
 * They bypass Firestore security rules and have elevated privileges
 */

/**
 * Get a single business by ID (Admin SDK version)
 * @param userId - User ID
 * @param businessId - Business ID
 * @returns Business data or null if not found
 */
export async function getBusinessAdmin(
  userId: string,
  businessId: string
): Promise<Business | null> {
  try {
    const businessRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("businesses")
      .doc(businessId);
    const businessSnap = await businessRef.get();

    if (businessSnap.exists) {
      const data = businessSnap.data();
      const validated = businessSchemaAdmin.parse({
        id: businessSnap.id,
        ...data,
      });
      return validated as Business;
    }

    return null;
  } catch (error) {
    console.error("Error fetching business (admin):", error);
    throw new Error("לא ניתן לטעון את פרטי העסק");
  }
}

/**
 * Update business fields (Admin SDK version)
 * @param userId - User ID
 * @param businessId - Business ID
 * @param data - Partial business data to update
 * @returns Updated business
 */
export async function updateBusinessAdmin(
  userId: string,
  businessId: string,
  data: Record<string, unknown>
): Promise<Business> {
  try {
    const businessRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("businesses")
      .doc(businessId);
    await businessRef.update(data);

    // Return the updated business
    return (await getBusinessAdmin(userId, businessId)) as Business;
  } catch (error) {
    console.error("Error updating business (admin):", error);
    throw new Error("לא ניתן לעדכן את העסק");
  }
}

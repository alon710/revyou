import { adminDb } from "@/lib/firebase/admin";

/**
 * Update user's selected account
 */
export async function updateUserSelectedAccount(
  uid: string,
  accountId: string | null
): Promise<void> {
  try {
    const userRef = adminDb.collection("users").doc(uid);
    await userRef.update({
      selectedAccountId: accountId,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating selected account:", error);
    throw new Error("לא ניתן לעדכן את החשבון הנבחר");
  }
}

/**
 * Update user's selected business
 */
export async function updateUserSelectedBusiness(
  uid: string,
  businessId: string | null
): Promise<void> {
  try {
    const userRef = adminDb.collection("users").doc(uid);
    await userRef.update({
      selectedBusinessId: businessId,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating selected business:", error);
    throw new Error("לא ניתן לעדכן את העסק הנבחר");
  }
}

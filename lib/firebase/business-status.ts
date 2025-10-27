import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

export async function disconnectBusiness(
  userId: string,
  businessId: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const businessRef = doc(db, "users", userId, "businesses", businessId);
    await updateDoc(businessRef, { connected: false });
  } catch (error) {
    console.error("Error disconnecting business:", error);
    throw new Error("לא ניתן לנתק את העסק");
  }
}

export async function reconnectBusiness(
  userId: string,
  businessId: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const businessRef = doc(db, "users", userId, "businesses", businessId);
    await updateDoc(businessRef, {
      connected: true,
      connectedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error reconnecting business:", error);
    throw new Error("לא ניתן לחבר מחדש את העסק");
  }
}

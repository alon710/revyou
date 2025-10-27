import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export async function disconnectLocation(
  userId: string,
  locationId: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const locationRef = doc(db, "users", userId, "locations", locationId);
    await updateDoc(locationRef, { connected: false });
  } catch (error) {
    console.error("Error disconnecting location:", error);
    throw new Error("לא ניתן לנתק את המיקום");
  }
}

export async function reconnectLocation(
  userId: string,
  locationId: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const locationRef = doc(db, "users", userId, "locations", locationId);
    await updateDoc(locationRef, {
      connected: true,
      connectedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error reconnecting location:", error);
    throw new Error("לא ניתן לחבר מחדש את המיקום");
  }
}

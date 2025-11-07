import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User } from "@/lib/types";

export async function getUser(uid: string): Promise<User | null> {
  if (!db) {
    console.error("Firestore not initialized");
    return null;
  }

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return { uid, ...data } as User;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("לא ניתן לטעון את פרטי המשתמש");
  }
}

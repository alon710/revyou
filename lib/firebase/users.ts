import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User } from "@/types/database";

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

export async function completeOnboarding(uid: string): Promise<void> {
  if (!db) {
    console.error("Firestore not initialized");
    throw new Error("Firestore not initialized");
  }

  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      onboardingCompleted: true,
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    throw new Error("לא ניתן לעדכן את סטטוס התחלת השימוש");
  }
}

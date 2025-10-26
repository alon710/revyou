import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { User } from "@/types/database";
import {
  userSchema,
  userUpdateSchema,
  UserUpdateInput,
} from "@/lib/validation/database";

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

export async function createUser(
  uid: string,
  email: string
): Promise<User> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const userData: Omit<User, "createdAt"> & {
      createdAt: ReturnType<typeof serverTimestamp>;
    } = {
      uid,
      email,
      createdAt: serverTimestamp(),
    };

    const userRef = doc(db, "users", uid);
    await setDoc(userRef, userData);

    // Return the created user
    return (await getUser(uid)) as User;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("לא ניתן ליצור משתמש חדש");
  }
}

export async function updateUser(
  uid: string,
  data: UserUpdateInput
): Promise<User> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    // Validate update data
    const validatedData = userUpdateSchema.parse(data);

    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, validatedData);

    // Return the updated user
    return (await getUser(uid)) as User;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("לא ניתן לעדכן את פרטי המשתמש");
  }
}

export async function updateUserStripeCustomerId(
  uid: string,
  stripeCustomerId: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { stripeCustomerId });
  } catch (error) {
    console.error("Error updating Stripe customer ID:", error);
    throw new Error("לא ניתן לעדכן את פרטי התשלום");
  }
}

export async function updateUserGoogleRefreshToken(
  uid: string,
  googleRefreshToken: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { googleRefreshToken });
  } catch (error) {
    console.error("Error updating Google refresh token:", error);
    throw new Error("לא ניתן לעדכן את חיבור Google");
  }
}

export async function userExists(uid: string): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
}

export async function updateNotificationPreferences(
  uid: string,
  preferences: { emailOnNewReview: boolean }
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { notificationPreferences: preferences });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    throw new Error("לא ניתן לעדכן את הגדרות ההתראות");
  }
}

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { User, SubscriptionTier } from "@/types/database";
import {
  userSchema,
  userUpdateSchema,
  UserUpdateInput,
} from "@/lib/validation/database";

/**
 * User Database Operations
 * All CRUD operations for the users collection
 */

/**
 * Get a user by their UID
 * @param uid - User ID
 * @returns User data or null if not found
 */
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
      // Validate data before returning
      const validated = userSchema.parse({ uid, ...data });
      return validated as User;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("לא ניתן לטעון את פרטי המשתמש");
  }
}

/**
 * Create a new user document
 * @param uid - User ID
 * @param email - User email
 * @param displayName - User display name
 * @param photoURL - User photo URL
 * @returns Created user data
 */
export async function createUser(
  uid: string,
  email: string,
  displayName: string,
  photoURL: string
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
      displayName,
      photoURL,
      createdAt: serverTimestamp(),
      subscriptionTier: "free",
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

/**
 * Update user data
 * @param uid - User ID
 * @param data - Partial user data to update
 * @returns Updated user data
 */
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

/**
 * Get user's subscription tier
 * @param uid - User ID
 * @returns Subscription tier or 'free' as default
 */
export async function getUserSubscriptionTier(
  uid: string
): Promise<SubscriptionTier> {
  try {
    const user = await getUser(uid);
    return user?.subscriptionTier || "free";
  } catch (error) {
    console.error("Error fetching subscription tier:", error);
    return "free";
  }
}

/**
 * Update user's subscription tier
 * @param uid - User ID
 * @param tier - New subscription tier
 */
export async function updateUserSubscriptionTier(
  uid: string,
  tier: SubscriptionTier
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { subscriptionTier: tier });
  } catch (error) {
    console.error("Error updating subscription tier:", error);
    throw new Error("לא ניתן לעדכן את חבילת המינוי");
  }
}

/**
 * Update user's Stripe customer ID
 * @param uid - User ID
 * @param stripeCustomerId - Stripe customer ID
 */
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

/**
 * Update user's Google refresh token (encrypted)
 * @param uid - User ID
 * @param googleRefreshToken - Encrypted Google refresh token
 */
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

/**
 * Check if a user exists
 * @param uid - User ID
 * @returns True if user exists, false otherwise
 */
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

/**
 * Update user's notification preferences
 * @param uid - User ID
 * @param preferences - Notification preferences
 */
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

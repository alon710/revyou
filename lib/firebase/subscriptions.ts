import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { Subscription, SubscriptionStatus } from "@/types/database";
import {
  subscriptionSchema,
  subscriptionCreateSchema,
  subscriptionUpdateSchema,
  SubscriptionCreateInput,
  SubscriptionUpdateInput,
} from "@/lib/validation/database";

/**
 * Subscription Database Operations
 * All CRUD operations for the subscriptions collection
 */

/**
 * Get active subscription for a user
 * @param userId - User ID
 * @returns Active subscription or null if none found
 */
export async function getUserSubscription(
  userId: string
): Promise<Subscription | null> {
  if (!db) {
    console.error("Firestore not initialized");
    return null;
  }

  try {
    const subscriptionsRef = collection(db, "subscriptions");
    const q = query(
      subscriptionsRef,
      where("userId", "==", userId),
      where("status", "==", "active"),
      orderBy("currentPeriodEnd", "desc"),
      firestoreLimit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const validated = subscriptionSchema.parse({ id: doc.id, ...data });
      return validated as Subscription;
    }

    return null;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    throw new Error("לא ניתן לטעון את פרטי המינוי");
  }
}

/**
 * Get subscription by ID
 * @param subscriptionId - Subscription ID
 * @returns Subscription data or null if not found
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Subscription | null> {
  if (!db) {
    console.error("Firestore not initialized");
    return null;
  }

  try {
    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    const subscriptionSnap = await getDoc(subscriptionRef);

    if (subscriptionSnap.exists()) {
      const data = subscriptionSnap.data();
      const validated = subscriptionSchema.parse({
        id: subscriptionSnap.id,
        ...data,
      });
      return validated as Subscription;
    }

    return null;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    throw new Error("לא ניתן לטעון את המינוי");
  }
}

/**
 * Get subscription by Stripe subscription ID
 * @param stripeSubscriptionId - Stripe subscription ID
 * @returns Subscription data or null if not found
 */
export async function getSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<Subscription | null> {
  if (!db) {
    console.error("Firestore not initialized");
    return null;
  }

  try {
    const subscriptionsRef = collection(db, "subscriptions");
    const q = query(
      subscriptionsRef,
      where("stripeSubscriptionId", "==", stripeSubscriptionId),
      firestoreLimit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const validated = subscriptionSchema.parse({ id: doc.id, ...data });
      return validated as Subscription;
    }

    return null;
  } catch (error) {
    console.error("Error fetching subscription by Stripe ID:", error);
    throw new Error("לא ניתן לטעון את המינוי");
  }
}

/**
 * Create a new subscription
 * @param data - Subscription data (without id)
 * @returns Created subscription with ID
 */
export async function createSubscription(
  data: Omit<SubscriptionCreateInput, "cancelAtPeriodEnd"> & {
    currentPeriodEnd: Date;
  }
): Promise<Subscription> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const subscriptionData = {
      ...data,
      currentPeriodEnd: Timestamp.fromDate(data.currentPeriodEnd),
      cancelAtPeriodEnd: false,
    };

    // Validate before creating
    subscriptionCreateSchema.parse(subscriptionData);

    const subscriptionsRef = collection(db, "subscriptions");
    const docRef = await addDoc(subscriptionsRef, subscriptionData);

    // Return the created subscription
    return (await getSubscription(docRef.id)) as Subscription;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw new Error("לא ניתן ליצור מינוי חדש");
  }
}

/**
 * Update subscription status
 * @param subscriptionId - Subscription ID
 * @param status - New subscription status
 * @returns Updated subscription
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus
): Promise<Subscription> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    await updateDoc(subscriptionRef, { status });

    // Return the updated subscription
    return (await getSubscription(subscriptionId)) as Subscription;
  } catch (error) {
    console.error("Error updating subscription status:", error);
    throw new Error("לא ניתן לעדכן את סטטוס המינוי");
  }
}

/**
 * Update subscription data
 * @param subscriptionId - Subscription ID
 * @param data - Partial subscription data to update
 * @returns Updated subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  data: Omit<SubscriptionUpdateInput, "currentPeriodEnd"> & {
    currentPeriodEnd?: Date;
  }
): Promise<Subscription> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const updateData: Record<string, unknown> = { ...data };

    // Convert Date to Timestamp if provided
    if (data.currentPeriodEnd) {
      updateData.currentPeriodEnd = Timestamp.fromDate(data.currentPeriodEnd);
    }

    // Validate update data
    subscriptionUpdateSchema.parse(updateData);

    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    await updateDoc(subscriptionRef, updateData);

    // Return the updated subscription
    return (await getSubscription(subscriptionId)) as Subscription;
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw new Error("לא ניתן לעדכן את המינוי");
  }
}

/**
 * Cancel subscription (mark to cancel at period end)
 * @param subscriptionId - Subscription ID
 * @returns Updated subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Subscription> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    await updateDoc(subscriptionRef, { cancelAtPeriodEnd: true });

    // Return the updated subscription
    return (await getSubscription(subscriptionId)) as Subscription;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw new Error("לא ניתן לבטל את המינוי");
  }
}

/**
 * Reactivate a canceled subscription
 * @param subscriptionId - Subscription ID
 * @returns Updated subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Subscription> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    await updateDoc(subscriptionRef, { cancelAtPeriodEnd: false });

    // Return the updated subscription
    return (await getSubscription(subscriptionId)) as Subscription;
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    throw new Error("לא ניתן להפעיל מחדש את המינוי");
  }
}

/**
 * Check if user has an active subscription
 * @param userId - User ID
 * @returns True if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId);
    return subscription !== null && subscription.status === "active";
  } catch (error) {
    console.error("Error checking active subscription:", error);
    return false;
  }
}

/**
 * Get all subscriptions for a user (including inactive)
 * @param userId - User ID
 * @returns Array of subscriptions
 */
export async function getUserSubscriptions(
  userId: string
): Promise<Subscription[]> {
  if (!db) {
    console.error("Firestore not initialized");
    return [];
  }

  try {
    const subscriptionsRef = collection(db, "subscriptions");
    const q = query(
      subscriptionsRef,
      where("userId", "==", userId),
      orderBy("currentPeriodEnd", "desc")
    );

    const querySnapshot = await getDocs(q);
    const subscriptions: Subscription[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      try {
        const validated = subscriptionSchema.parse({ id: doc.id, ...data });
        subscriptions.push(validated as Subscription);
      } catch (error) {
        console.error("Invalid subscription data:", doc.id, error);
      }
    });

    return subscriptions;
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw new Error("לא ניתן לטעון את המינויים");
  }
}

/**
 * Check if subscription is expiring soon (within 7 days)
 * @param subscription - Subscription object
 * @returns True if expiring soon
 */
export function isSubscriptionExpiringSoon(
  subscription: Subscription
): boolean {
  const now = new Date();
  const periodEnd = subscription.currentPeriodEnd.toDate();
  const daysUntilExpiry = Math.ceil(
    (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
}

/**
 * Check if subscription has expired
 * @param subscription - Subscription object
 * @returns True if expired
 */
export function isSubscriptionExpired(subscription: Subscription): boolean {
  const now = new Date();
  const periodEnd = subscription.currentPeriodEnd.toDate();

  return periodEnd < now;
}

/**
 * Get days remaining in subscription period
 * @param subscription - Subscription object
 * @returns Number of days remaining (negative if expired)
 */
export function getDaysRemaining(subscription: Subscription): number {
  const now = new Date();
  const periodEnd = subscription.currentPeriodEnd.toDate();
  return Math.ceil(
    (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
}

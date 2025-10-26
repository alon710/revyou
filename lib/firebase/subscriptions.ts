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

    subscriptionCreateSchema.parse(subscriptionData);

    const subscriptionsRef = collection(db, "subscriptions");
    const docRef = await addDoc(subscriptionsRef, subscriptionData);

    return (await getSubscription(docRef.id)) as Subscription;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw new Error("לא ניתן ליצור מינוי חדש");
  }
}

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

    return (await getSubscription(subscriptionId)) as Subscription;
  } catch (error) {
    console.error("Error updating subscription status:", error);
    throw new Error("לא ניתן לעדכן את סטטוס המינוי");
  }
}

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

    if (data.currentPeriodEnd) {
      updateData.currentPeriodEnd = Timestamp.fromDate(data.currentPeriodEnd);
    }

    subscriptionUpdateSchema.parse(updateData);

    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    await updateDoc(subscriptionRef, updateData);

    return (await getSubscription(subscriptionId)) as Subscription;
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw new Error("לא ניתן לעדכן את המינוי");
  }
}

export async function cancelSubscription(
  subscriptionId: string
): Promise<Subscription> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    await updateDoc(subscriptionRef, { cancelAtPeriodEnd: true });

    return (await getSubscription(subscriptionId)) as Subscription;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw new Error("לא ניתן לבטל את המינוי");
  }
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId);
    return subscription !== null && subscription.status === "active";
  } catch (error) {
    console.error("Error checking active subscription:", error);
    return false;
  }
}

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

export function isSubscriptionExpired(subscription: Subscription): boolean {
  const now = new Date();
  const periodEnd = subscription.currentPeriodEnd.toDate();

  return periodEnd < now;
}

export function getDaysRemaining(subscription: Subscription): number {
  const now = new Date();
  const periodEnd = subscription.currentPeriodEnd.toDate();
  return Math.ceil(
    (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
}

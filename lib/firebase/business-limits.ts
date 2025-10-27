import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { type PlanLimits, getPlanLimits } from "@/lib/stripe/entitlements";
import { enrichProduct } from "@/lib/stripe/product-parser";
import { getUserBusinesses } from "@/lib/firebase/businesses";

export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  if (!db) {
    console.error("Firestore not initialized");
    return {
      businesses: 1,
      reviewsPerMonth: 5,
      autoPost: false,
      requireApproval: true,
    };
  }

  try {
    const subscriptionsRef = collection(db, "users", userId, "subscriptions");
    const activeSubQuery = query(
      subscriptionsRef,
      where("status", "in", ["active", "trialing"])
    );
    const subSnapshot = await getDocs(activeSubQuery);

    if (subSnapshot.empty) {
      const productsRef = collection(db, "products");
      const freeProductQuery = query(
        productsRef,
        where("active", "==", true),
        where("metadata.plan_id", "==", "free")
      );
      const freeProductSnapshot = await getDocs(freeProductQuery);

      if (!freeProductSnapshot.empty) {
        const productData = freeProductSnapshot.docs[0].data() as Record<
          string,
          unknown
        >;
        const enriched = enrichProduct({
          ...productData,
          id: freeProductSnapshot.docs[0].id,
        } as Parameters<typeof enrichProduct>[0]);
        return getPlanLimits(enriched);
      }

      return {
        businesses: 1,
        reviewsPerMonth: 5,
        autoPost: false,
        requireApproval: true,
      };
    }

    const subData = subSnapshot.docs[0].data();
    const productId = subData.product;

    const productRef = doc(db, "products", productId);
    const productSnapshot = await getDoc(productRef);

    if (!productSnapshot.exists()) {
      console.error("Product not found:", productId);
      return {
        businesses: 1,
        reviewsPerMonth: 5,
        autoPost: false,
        requireApproval: true,
      };
    }

    const productData = productSnapshot.data() as Record<string, unknown>;
    const enriched = enrichProduct({
      ...productData,
      id: productSnapshot.id,
    } as Parameters<typeof enrichProduct>[0]);

    return getPlanLimits(enriched);
  } catch (error) {
    console.error("Error fetching user plan limits:", error);
    return {
      businesses: 1,
      reviewsPerMonth: 5,
      autoPost: false,
      requireApproval: true,
    };
  }
}

export async function checkBusinessLimit(userId: string): Promise<boolean> {
  try {
    const limits = await getUserPlanLimits(userId);
    const businesses = await getUserBusinesses(userId);
    return businesses.length < limits.businesses;
  } catch (error) {
    console.error("Error checking business limit:", error);
    return false;
  }
}

export async function getRemainingBusinessSlots(
  userId: string
): Promise<number> {
  try {
    const limits = await getUserPlanLimits(userId);
    const businesses = await getUserBusinesses(userId);
    return Math.max(0, limits.businesses - businesses.length);
  } catch (error) {
    console.error("Error getting remaining business slots:", error);
    return 0;
  }
}

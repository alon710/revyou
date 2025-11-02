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
import { getUserBusinesses } from "@/lib/firebase/business";

async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
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
    const productId =
      typeof subData.product === "string"
        ? subData.product
        : subData.product.id;

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

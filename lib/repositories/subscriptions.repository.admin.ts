import { adminDb } from "@/lib/firebase/admin";
import type { Subscription, SubscriptionCreate, SubscriptionUpdate, SubscriptionWithProduct } from "@/lib/types";
import { BaseRepository } from "./base.repository";
import { type PlanLimits, getPlanLimits } from "@/lib/stripe/entitlements";
import { enrichProduct } from "@/lib/stripe/product-parser";
import type { Product } from "@invertase/firestore-stripe-payments";

export class SubscriptionsRepositoryAdmin extends BaseRepository<SubscriptionCreate, Subscription, SubscriptionUpdate> {
  constructor() {
    super("subscriptions");
  }

  async get(_id: string): Promise<Subscription | null> {
    throw new Error("Use getActiveSubscription() instead");
  }

  async list(): Promise<Subscription[]> {
    throw new Error("Use getUserSubscriptions() instead");
  }

  async create(_data: SubscriptionCreate): Promise<Subscription> {
    throw new Error("Subscription creation should be handled by Stripe extension");
  }

  async update(_id: string, _data: SubscriptionUpdate): Promise<Subscription> {
    throw new Error("Subscription updates should be handled by Stripe extension");
  }

  async delete(_id: string): Promise<void> {
    throw new Error("Subscription deletion should be handled by Stripe extension");
  }

  async getActiveSubscription(userId: string): Promise<SubscriptionWithProduct | null> {
    try {
      const subscriptionsRef = adminDb.collection(`users/${userId}/subscriptions`);
      const activeSubQuery = subscriptionsRef.where("status", "in", ["active", "trialing"]);
      const snapshot = await activeSubQuery.get();

      if (snapshot.empty) {
        return null;
      }

      const subDoc = snapshot.docs[0];
      const subData = subDoc.data() as Subscription;
      const productId = typeof subData.product === "string" ? subData.product : subData.product.id;

      const productDoc = await adminDb.collection("products").doc(productId).get();

      if (!productDoc.exists) {
        console.error("Product not found:", productId);
        return null;
      }

      const productData = productDoc.data() as Product;

      return {
        ...subData,
        id: subDoc.id,
        productData: {
          ...productData,
          id: productDoc.id,
        },
      };
    } catch (error) {
      console.error("Error fetching active subscription:", error);
      return null;
    }
  }

  async getUserPlanLimits(userId: string): Promise<PlanLimits> {
    try {
      const subscription = await this.getActiveSubscription(userId);

      if (subscription?.productData) {
        const enriched = enrichProduct(subscription.productData);
        return getPlanLimits(enriched);
      }

      const productsRef = adminDb.collection("products");
      const freeProductQuery = productsRef.where("active", "==", true).where("metadata.plan_id", "==", "free");
      const freeProductSnapshot = await freeProductQuery.get();

      if (!freeProductSnapshot.empty) {
        const productDoc = freeProductSnapshot.docs[0];
        const productData = productDoc.data() as Product;
        const enriched = enrichProduct({
          ...productData,
          id: productDoc.id,
        });
        return getPlanLimits(enriched);
      }

      return {
        businesses: 1,
        reviewsPerMonth: 5,
        autoPost: false,
        requireApproval: true,
      };
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
}

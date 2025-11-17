import { getAdminDb } from "@/lib/firebase/admin";
import type { Subscription, SubscriptionCreate, SubscriptionUpdate } from "@/lib/types/subscription.types";
import { BaseRepository } from "./base.repository";
import { type PlanLimits, getPlanLimits, type PlanTier } from "@/lib/subscriptions/plans";
import { Timestamp } from "firebase-admin/firestore";
import { startOfMonth } from "date-fns";

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
    throw new Error("Use subscription.actions.ts instead");
  }

  async update(_id: string, _data: SubscriptionUpdate): Promise<Subscription> {
    throw new Error("Use subscription.actions.ts instead");
  }

  async delete(_id: string): Promise<void> {
    throw new Error("Use subscription.actions.ts instead");
  }

  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    try {
      const subscriptionsRef = getAdminDb().collection(`users/${userId}/subscriptions`);
      const activeSubQuery = subscriptionsRef.where("status", "==", "active").orderBy("createdAt", "desc").limit(1);
      const snapshot = await activeSubQuery.get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        userId: data.userId,
        planTier: data.planTier as PlanTier,
        status: data.status,
        billingInterval: data.billingInterval,
        createdAt: data.createdAt.toDate(),
        currentPeriodStart: data.currentPeriodStart.toDate(),
        currentPeriodEnd: data.currentPeriodEnd.toDate(),
        canceledAt: data.canceledAt ? data.canceledAt.toDate() : null,
      };
    } catch (error) {
      console.error("Error fetching active subscription:", error);
      return null;
    }
  }

  async getUserPlanLimits(userId: string): Promise<PlanLimits> {
    try {
      const subscription = await this.getActiveSubscription(userId);

      if (subscription) {
        return getPlanLimits(subscription.planTier);
      }

      // Default to free plan
      return getPlanLimits("free");
    } catch (error) {
      console.error("Error fetching user plan limits:", error);
      return getPlanLimits("free");
    }
  }

  async countUserReviewsThisMonth(userId: string): Promise<number> {
    try {
      const startDate = startOfMonth(new Date());
      const startTimestamp = Timestamp.fromDate(startDate);

      const accountsRef = getAdminDb().collection(`users/${userId}/accounts`);
      const accountsSnapshot = await accountsRef.get();

      if (accountsSnapshot.empty) {
        return 0;
      }

      let totalReviewCount = 0;

      for (const accountDoc of accountsSnapshot.docs) {
        const accountId = accountDoc.id;

        const businessesRef = getAdminDb().collection(`users/${userId}/accounts/${accountId}/businesses`);
        const businessesQuery = businessesRef.where("connected", "==", true);
        const businessesSnapshot = await businessesQuery.get();

        for (const businessDoc of businessesSnapshot.docs) {
          const reviewsRef = getAdminDb().collection(
            `users/${userId}/accounts/${accountId}/businesses/${businessDoc.id}/reviews`
          );
          const reviewsQuery = reviewsRef.where("receivedAt", ">=", startTimestamp);
          const countSnapshot = await reviewsQuery.count().get();
          totalReviewCount += countSnapshot.data().count;
        }
      }

      return totalReviewCount;
    } catch (error) {
      console.error("Error counting user reviews this month:", error);
      return 0;
    }
  }
}

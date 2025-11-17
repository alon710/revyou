"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/firebase.config";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { getPlanLimits, type PlanTier, type PlanLimits } from "@/lib/subscriptions/plans";
import type { Subscription, SubscriptionStatus } from "@/lib/types/subscription.types";

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  isActive: boolean;
  planType: PlanTier;
  limits: PlanLimits;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planType, setPlanType] = useState<PlanTier>("free");
  const [limits, setLimits] = useState<PlanLimits>(getPlanLimits("free"));

  useEffect(() => {
    if (!user) {
      return;
    }

    // Listen to subscription changes in Firestore
    const subscriptionsRef = collection(db, "users", user.id, "subscriptions");
    const q = query(subscriptionsRef, where("status", "==", "active"), orderBy("createdAt", "desc"), limit(1));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // No active subscription, user is on free plan
          setSubscription(null);
          setPlanType("free");
          setLimits(getPlanLimits("free"));
          setLoading(false);
          setError(null);
          return;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        const sub: Subscription = {
          id: doc.id,
          userId: data.userId,
          planTier: data.planTier as PlanTier,
          status: data.status as SubscriptionStatus,
          billingInterval: data.billingInterval,
          createdAt: data.createdAt.toDate(),
          currentPeriodStart: data.currentPeriodStart.toDate(),
          currentPeriodEnd: data.currentPeriodEnd.toDate(),
          canceledAt: data.canceledAt ? data.canceledAt.toDate() : null,
        };

        setSubscription(sub);
        setPlanType(sub.planTier);
        setLimits(getPlanLimits(sub.planTier));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error listening to subscription changes:", err);
        setError("Error loading subscription");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const isActive = subscription?.status === "active";

  return {
    subscription,
    loading,
    error,
    isActive,
    planType,
    limits,
  };
}

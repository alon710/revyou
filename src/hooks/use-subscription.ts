"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPlanLimits, type PlanTier, type PlanLimits } from "@/lib/subscriptions/plans";
import type { Subscription } from "@/lib/db/schema";
import { getActiveSubscription } from "@/lib/actions/subscription.actions";

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
      setLoading(false);
      return;
    }

    async function loadSubscription() {
      try {
        const sub = await getActiveSubscription();

        if (!sub) {
          setSubscription(null);
          setPlanType("free");
          setLimits(getPlanLimits("free"));
        } else {
          setSubscription(sub);
          setPlanType(sub.planTier as PlanTier);
          setLimits(getPlanLimits(sub.planTier as PlanTier));
        }
        setError(null);
      } catch (err) {
        console.error("Error loading subscription:", err);
        setError("Error loading subscription");
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
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

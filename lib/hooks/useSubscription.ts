"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/auth";
import { onSubscriptionChange } from "@/lib/stripe/client";
import { getPlanFromPriceId } from "@/lib/stripe/config";
import type { PlanType } from "@/lib/stripe/config";

export interface Subscription {
  id: string;
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  current_period_end: number;
  current_period_start: number;
  cancel_at_period_end: boolean;
  price: {
    id: string;
    product: string;
  };
  trial_end?: number;
  trial_start?: number;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  isActive: boolean;
  isTrial: boolean;
  planType: PlanType;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setSubscription(null);
      return;
    }

    try {
      // Listen to subscription changes using the extension SDK
      const unsubscribe = onSubscriptionChange((snapshot) => {
        // Get active or trialing subscriptions
        const activeSubs = snapshot.subscriptions.filter(
          (sub: { status: string }) =>
            sub.status === "active" || sub.status === "trialing"
        );

        if (activeSubs.length === 0) {
          setSubscription(null);
          setLoading(false);
          return;
        }

        // Get the first active subscription (users should only have one)
        const sub = activeSubs[0];

        setSubscription({
          id: sub.id,
          status: sub.status as Subscription["status"],
          // Convert UTC string timestamps to Unix epoch seconds
          current_period_end: new Date(sub.current_period_end).getTime() / 1000,
          current_period_start:
            new Date(sub.current_period_start).getTime() / 1000,
          cancel_at_period_end: sub.cancel_at_period_end,
          price: {
            id: sub.price, // SDK provides price ID directly as string
            product: sub.product, // SDK provides product ID directly
          },
          // Parse trial timestamps if present
          trial_end: sub.trial_end
            ? new Date(sub.trial_end).getTime() / 1000
            : undefined,
          trial_start: sub.trial_start
            ? new Date(sub.trial_start).getTime() / 1000
            : undefined,
        });
        setLoading(false);
        setError(null);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (err) {
      console.error("Error setting up subscription listener:", err);
      setError("אירעה שגיאה בהגדרת מעקב מנוי");
      setLoading(false);
    }
  }, [user]);

  // Determine plan type based on price ID
  const planType = subscription
    ? getPlanFromPriceId(subscription.price.id)
    : "free";

  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";
  const isTrial = subscription?.status === "trialing";

  return {
    subscription,
    loading,
    error,
    isActive,
    isTrial,
    planType,
  };
}

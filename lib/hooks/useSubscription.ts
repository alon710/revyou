"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/auth";
import {
  onSubscriptionChange,
  getAvailableProducts,
} from "@/lib/stripe/client";
import {
  getPlanLimits,
  type PlanType,
  type PlanLimits,
} from "@/lib/stripe/entitlements";
import { EnrichedProduct, enrichProduct } from "@/lib/stripe/product-parser";

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
  limits: PlanLimits;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planType, setPlanType] = useState<PlanType>("free");
  const [limits, setLimits] = useState<PlanLimits>({
    locations: 1,
    reviewsPerMonth: 5,
    autoPost: false,
    requireApproval: true,
  });

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setLoading(false);
        setSubscription(null);
        setPlanType("free");
        setLimits({
          locations: 1,
          reviewsPerMonth: 5,
          autoPost: false,
          requireApproval: true,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadingTimer = setTimeout(() => setLoading(true), 0);
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = async () => {
      try {
        const products = await getAvailableProducts();
        const enrichedProducts = products.map(enrichProduct);

        const productMap = new Map<
          string,
          { planId: PlanType; product: EnrichedProduct }
        >(
          enrichedProducts.map((enriched) => [
            enriched.id,
            { planId: enriched.planId as PlanType, product: enriched },
          ])
        );

        const freeProduct = enrichedProducts.find((p) => p.planId === "free");
        const defaultLimits = freeProduct
          ? getPlanLimits(freeProduct)
          : {
              locations: 1,
              reviewsPerMonth: 5,
              autoPost: false,
              requireApproval: true,
            };

        unsubscribe = onSubscriptionChange((snapshot) => {
          const activeSubs = snapshot.subscriptions.filter(
            (sub: { status: string }) =>
              sub.status === "active" || sub.status === "trialing"
          );

          if (activeSubs.length === 0) {
            setSubscription(null);
            setPlanType("free");
            setLimits(defaultLimits);
            setLoading(false);
            return;
          }

          const sub = activeSubs[0];

          setSubscription({
            id: sub.id,
            status: sub.status as Subscription["status"],

            current_period_end:
              new Date(sub.current_period_end).getTime() / 1000,
            current_period_start:
              new Date(sub.current_period_start).getTime() / 1000,
            cancel_at_period_end: sub.cancel_at_period_end,
            price: {
              id: sub.price,
              product: sub.product,
            },

            trial_end: sub.trial_end
              ? new Date(sub.trial_end).getTime() / 1000
              : undefined,
            trial_start: sub.trial_start
              ? new Date(sub.trial_start).getTime() / 1000
              : undefined,
          });

          const productData = productMap.get(sub.product);
          if (productData) {
            setPlanType(productData.planId);
            setLimits(getPlanLimits(productData.product));
          } else {
            setPlanType("free");
            setLimits(defaultLimits);
          }

          setLoading(false);
          setError(null);
        });
      } catch (err) {
        console.error("Error setting up subscription listener:", err);
        setError("אירעה שגיאה בהגדרת מעקב מנוי");
        setLoading(false);
      }
    };

    setupSubscription();

    return () => {
      clearTimeout(loadingTimer);
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

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
    limits,
  };
}

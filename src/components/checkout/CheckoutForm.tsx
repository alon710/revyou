"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { PlanTier } from "@/lib/subscriptions/plans";
import type { BillingInterval } from "@/lib/types/subscription.types";
import { useAuth } from "@/contexts/AuthContext";
import { createCheckoutSession } from "@/lib/actions/subscription.actions";

interface CheckoutFormProps {
  plan: PlanTier | null;
  period: BillingInterval | null;
  coupon: string | null;
}

export function CheckoutForm({ plan, period, coupon }: CheckoutFormProps) {
  const router = useRouter();
  const t = useTranslations("checkout");
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasStartedProcessing = useRef(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (hasStartedProcessing.current || !user) return;

    if (plan === "free") {
      router.push("/dashboard/home");
      return;
    }

    if (!plan || !period) {
      toast.error(t("missingPriceDetails"));
      router.push("/");
      return;
    }

    if (plan && period && !error) {
      hasStartedProcessing.current = true;

      async function processStripeCheckout() {
        if (!plan || !period) return;
        if (plan === "free") return;

        try {
          const { url, error: actionError } = await createCheckoutSession(plan, period, coupon || undefined);

          if (actionError) {
            setError(actionError || t("error"));
            return;
          }

          if (url) {
            window.location.href = url;
          } else {
            setError(t("error"));
          }
        } catch (err) {
          console.error("Error creating checkout session:", err);
          setError(t("error"));
        }
      }

      processStripeCheckout();
    }
  }, [plan, period, router, error, t, user, coupon]);

  if (!error && plan && period) {
    return <Loading fullScreen text={t("processing")} description={t("almostThere")} size="lg" />;
  }

  return null;
}

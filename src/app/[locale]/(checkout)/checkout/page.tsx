"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createSubscription } from "@/lib/actions/subscription.actions";
import type { PlanTier } from "@/lib/subscriptions/plans";
import type { BillingInterval } from "@/lib/types/subscription.types";
import { useAuth } from "@/contexts/AuthContext";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("checkout");
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasStartedProcessing = useRef(false);

  const plan = searchParams.get("plan") as PlanTier;
  const period = searchParams.get("period") as BillingInterval;

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

      async function processMockCheckout() {
        try {
          const result = await createSubscription(plan, period);

          if (result.success) {
            toast.success(t("success"));
            setTimeout(() => {
              router.push("/dashboard/home");
            }, 1000);
          } else {
            setError(result.error || t("error"));
          }
        } catch (err) {
          console.error("Error creating subscription:", err);
          setError(t("error"));
        }
      }

      processMockCheckout();
    }
  }, [plan, period, router, error, t, user]);

  if (!error && plan && period) {
    return <Loading fullScreen text={t("processing")} description={t("almostThere")} size="lg" />;
  }

  return null;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Loading fullScreen />}>
      <CheckoutForm />
    </Suspense>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createSubscription } from "@/lib/actions/subscription.actions";
import type { PlanTier } from "@/lib/subscriptions/plans";
import type { BillingInterval } from "@/lib/types/subscription.types";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("checkout");
  const [error, setError] = useState<string | null>(null);

  const plan = searchParams.get("plan") as PlanTier;
  const period = searchParams.get("period") as BillingInterval;

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
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
      async function processMockCheckout() {
        try {
          // Mock payment - automatically create subscription
          const result = await createSubscription(plan, period);

          if (result.success) {
            toast.success("Subscription activated successfully!");
            // Small delay to show success message
            setTimeout(() => {
              router.push("/dashboard/home");
            }, 1000);
          } else {
            setError(result.error || "Failed to create subscription");
          }
        } catch (err) {
          console.error("Error creating subscription:", err);
          setError(t("checkoutError"));
        }
      }

      processMockCheckout();
    }
  }, [plan, period, router, error, t]);

  if (!error && plan && period) {
    return <Loading fullScreen text="Processing your subscription..." description="Almost there!" size="lg" />;
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

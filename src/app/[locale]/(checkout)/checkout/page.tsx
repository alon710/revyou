"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSubscriptionCheckout } from "@/lib/stripe/client";
import { useRouter } from "@/i18n/routing";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("checkout");
  const [error, setError] = useState<string | null>(null);

  const plan = searchParams.get("plan");
  const priceId = searchParams.get("priceId");
  const onboarding = searchParams.get("onboarding") === "true";
  const customSuccessUrl = searchParams.get("success_url");
  const customCancelUrl = searchParams.get("cancel_url");
  const success = searchParams.get("success") === "true";

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      router.push("/dashboard/home");
      return;
    }

    if (plan === "free") {
      router.push("/dashboard/home");
      return;
    }

    if (plan !== "free" && !priceId) {
      toast.error(t("missingPriceDetails"));
      router.push("/");
      return;
    }

    if (priceId && !error) {
      async function initiateCheckout() {
        try {
          let options = undefined;

          if (customSuccessUrl || customCancelUrl) {
            options = {
              success_url: customSuccessUrl || `${window.location.origin}/dashboard`,
              cancel_url: customCancelUrl || `${window.location.origin}/`,
            };
          } else if (onboarding) {
            options = {
              success_url: `${window.location.origin}/checkout?success=true`,
              cancel_url: `${window.location.origin}/dashboard`,
            };
          }

          const session = await createSubscriptionCheckout(priceId!, options);
          window.location.assign(session.url);
        } catch (err) {
          console.error("Error creating checkout session:", err);
          setError(t("checkoutError"));
        }
      }

      initiateCheckout();
    }
  }, [plan, priceId, router, error, onboarding, customSuccessUrl, customCancelUrl, success, t]);

  if (!error && priceId) {
    return <Loading fullScreen text={t("preparingPayment")} description={t("redirectingToPayment")} size="lg" />;
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

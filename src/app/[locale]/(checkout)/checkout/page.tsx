"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSubscriptionCheckout } from "@/lib/stripe/client";
import { useRouter } from "@/i18n/routing";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("checkout");
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);

  const plan = searchParams.get("plan");
  const priceId = searchParams.get("priceId");

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

    if (plan !== "free" && !priceId) {
      toast.error(t("missingPriceDetails"));
      router.push("/");
      return;
    }

    if (priceId && !error) {
      async function initiateCheckout() {
        try {
          const session = await createSubscriptionCheckout(priceId!, {
            success_url: `${window.location.origin}/${locale}/dashboard/home`,
            cancel_url: `${window.location.origin}/`,
          });
          window.location.assign(session.url);
        } catch (err) {
          console.error("Error creating checkout session:", err);
          setError(t("checkoutError"));
        }
      }

      initiateCheckout();
    }
  }, [plan, priceId, router, error, locale, t]);

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

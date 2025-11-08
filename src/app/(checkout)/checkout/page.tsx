"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSubscriptionCheckout } from "@/lib/stripe/client";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      router.push("/dashboard");
      return;
    }

    if (plan === "free") {
      router.push("/dashboard");
      return;
    }

    if (plan !== "free" && !priceId) {
      toast.error("חסרים פרטי מחיר. אנא בחר תוכנית מעמוד התמחור.");
      router.push("/");
      return;
    }

    if (priceId && !error) {
      async function initiateCheckout() {
        try {
          let options = undefined;

          if (customSuccessUrl || customCancelUrl) {
            options = {
              success_url:
                customSuccessUrl || `${window.location.origin}/dashboard`,
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
          setError("אירעה שגיאה בעת יצירת הזמנה. אנא נסה שוב או פנה לתמיכה.");
        }
      }

      initiateCheckout();
    }
  }, [
    plan,
    priceId,
    router,
    error,
    onboarding,
    customSuccessUrl,
    customCancelUrl,
    success,
  ]);

  if (!error && priceId) {
    return (
      <Loading
        fullScreen
        text="מכין את התשלום... "
        description="מעביר אותך לעמוד התשלום המאובטח"
        size="lg"
      />
    );
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

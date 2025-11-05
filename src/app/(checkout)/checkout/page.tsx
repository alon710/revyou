"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createSubscriptionCheckout } from "@/lib/stripe/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const plan = searchParams.get("plan");
  const priceId = searchParams.get("priceId");
  const onboarding = searchParams.get("onboarding") === "true";
  const customSuccessUrl = searchParams.get("success_url");
  const customCancelUrl = searchParams.get("cancel_url");
  const missingPriceId = !authLoading && user && plan !== "free" && !priceId;

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (missingPriceId) {
      toast.error("חסרים פרטי מחיר. אנא בחר תוכנית מעמוד התמחור.");
      router.push("/");
    }
  }, [missingPriceId, router]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (plan === "free") {
      router.push("/dashboard");
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
              success_url: `${window.location.origin}/success?onboarding=true`,
              cancel_url: `${window.location.origin}/onboarding/step-1`,
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
    user,
    authLoading,
    plan,
    priceId,
    router,
    error,
    onboarding,
    customSuccessUrl,
    customCancelUrl,
  ]);

  if (authLoading || (!error && priceId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">מכין את התשלום...</h2>
            <p className="text-muted-foreground">
              מעביר אותך לעמוד התשלום המאובטח
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">טוען...</h2>
            </div>
          </div>
        </div>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}

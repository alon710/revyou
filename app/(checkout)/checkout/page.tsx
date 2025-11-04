"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createSubscriptionCheckout } from "@/lib/stripe/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const plan = searchParams.get("plan");
  const priceId = searchParams.get("priceId");
  const missingPriceId = !authLoading && user && plan !== "free" && !priceId;

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
          const session = await createSubscriptionCheckout(priceId!);
          window.location.assign(session.url);
        } catch (err) {
          console.error("Error creating checkout session:", err);
          setError("אירעה שגיאה בעת יצירת הזמנה. אנא נסה שוב או פנה לתמיכה.");
        }
      }

      initiateCheckout();
    }
  }, [user, authLoading, plan, priceId, router, error]);

  if (authLoading || (!error && priceId)) {
    return (
      <Loading
        fullScreen
        size="lg"
        title="מכין את התשלום..."
        description="מעביר אותך לעמוד התשלום המאובטח"
      />
    );
  }

  if (missingPriceId || error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertTitle>שגיאה</AlertTitle>
            <AlertDescription>
              {error || "חסרים פרטי מחיר. אנא בחר תוכנית מעמוד התמחור."}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="flex-1"
            >
              חזרה לדף הבית
            </Button>
            <Button onClick={() => router.back()} className="flex-1">
              נסה שוב
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Loading fullScreen size="lg" title="טוען..." />}>
      <CheckoutForm />
    </Suspense>
  );
}

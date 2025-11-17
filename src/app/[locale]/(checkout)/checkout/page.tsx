"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createSubscription } from "@/lib/actions/subscription.actions";
import { getAccounts } from "@/lib/actions/accounts.actions";
import type { PlanTier } from "@/lib/subscriptions/plans";
import type { BillingInterval } from "@/lib/types/subscription.types";
import { useAuth } from "@/contexts/AuthContext";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("checkout");
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  const plan = searchParams.get("plan") as PlanTier;
  const period = searchParams.get("period") as BillingInterval;

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Fetch user's first account
  useEffect(() => {
    async function fetchAccount() {
      if (!user) return;

      try {
        const accounts = await getAccounts(user.id);
        if (accounts.length > 0) {
          setAccountId(accounts[0].id);
        } else {
          setError("No account found. Please connect your Google Business Profile first.");
        }
      } catch (err) {
        console.error("Error fetching account:", err);
        setError("Failed to load account information");
      }
    }
    fetchAccount();
  }, [user]);

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

    if (plan && period && !error && accountId) {
      async function processMockCheckout() {
        if (!accountId) return; // Type guard
        try {
          // Mock payment - automatically create subscription
          const result = await createSubscription(accountId, plan, period);

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
  }, [plan, period, router, error, t, accountId]);

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

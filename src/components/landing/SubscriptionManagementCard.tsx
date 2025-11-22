"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, Crown } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Subscription } from "@/lib/db/schema";
import { getPlan } from "@/lib/subscriptions/plans";

interface SubscriptionManagementCardProps {
  subscription: Subscription;
}

export function SubscriptionManagementCard({ subscription }: SubscriptionManagementCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("landing.pricing");

  const plan = getPlan(subscription.planTier as "free" | "basic" | "pro");

  const handleManageBilling = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to open billing portal");
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (err) {
      console.error("Error opening billing portal:", err);
      setError(err instanceof Error ? err.message : "Failed to open billing portal");
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 sm:px-8 lg:px-12 mb-12">
      <div className="max-w-6xl mx-auto">
        <div className="relative p-6 rounded-lg border-2 border-primary shadow-xl bg-linear-to-br from-primary/15 via-primary/10 to-primary/5">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 shrink-0">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{t("yourCurrentPlan")}</h3>
                <p className="text-sm text-muted-foreground">
                  {plan.name} • <span className="text-primary font-medium">{t("statusActive")}</span>
                </p>
              </div>
            </div>

            <Button onClick={handleManageBilling} disabled={isLoading} className="shrink-0">
              {isLoading ? (
                t("loading")
              ) : (
                <>
                  {t("manageBilling")}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

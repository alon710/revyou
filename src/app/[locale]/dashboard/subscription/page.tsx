"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionInfo } from "@/components/dashboard/dashboard/SubscriptionInfo";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getUserStats } from "@/lib/actions/stats.actions";

export default function SubscriptionPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { subscription, planType, loading: subscriptionLoading } = useSubscription();
  const t = useTranslations("dashboard.subscription");
  const [businessesCount, setBusinessesCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [businessesPercent, setBusinessesPercent] = useState(0);
  const [reviewsPercent, setReviewsPercent] = useState(0);
  const [limits, setLimits] = useState({ businesses: 1, reviewsPerMonth: 10, autoPost: false, requireApproval: true });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!authUser) return;

    try {
      setLoading(true);

      const stats = await getUserStats(authUser.id);

      setBusinessesCount(stats.businesses);
      setReviewCount(stats.reviews);
      setBusinessesPercent(stats.businessesPercent);
      setReviewsPercent(stats.reviewsPercent);
      setLimits(stats.limits);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(t("errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [authUser, t]);

  useEffect(() => {
    if (!authLoading && authUser) {
      loadData();
    }
  }, [authUser, authLoading, loadData]);

  const handleUpgrade = () => {
    window.location.href = "/#pricing";
  };

  if (authLoading || loading || subscriptionLoading) {
    return <Loading size="md" fullScreen />;
  }

  if (!authUser) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="space-y-6">
        <SubscriptionInfo
          limits={limits}
          subscription={subscription}
          currentBusiness={businessesCount}
          currentReviews={reviewCount}
          businessesPercent={businessesPercent}
          reviewsPercent={reviewsPercent}
          planType={planType}
        />

        <div className="flex gap-3 flex-wrap">
          {planType === "free" && (
            <Button onClick={handleUpgrade} size="lg">
              {t("upgradePlan")}
            </Button>
          )}

          {planType !== "free" && (
            <div className="text-sm text-muted-foreground">
              <p>
                {t("currentPlan")}: {planType.toUpperCase()}
              </p>
              <p className="mt-1">{t("contactSupport")}</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

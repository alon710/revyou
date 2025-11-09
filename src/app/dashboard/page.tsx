"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionInfo } from "@/components/dashboard/dashboard/SubscriptionInfo";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";

export default function DashboardPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { subscription, planType, loading: subscriptionLoading } = useSubscription();
  const [businessesCount, setBusinessesCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [businessesPercent, setBusinessesPercent] = useState(0);
  const [reviewsPercent, setReviewsPercent] = useState(0);
  const [limits, setLimits] = useState({ businesses: 1, reviewsPerMonth: 5, autoPost: false, requireApproval: true });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!authUser) return;

    try {
      setLoading(true);

      const statsResponse = await fetch(`/api/users/${authUser.uid}/stats`);
      if (!statsResponse.ok) {
        throw new Error("Failed to fetch stats");
      }
      const stats = await statsResponse.json();

      setBusinessesCount(stats.businesses);
      setReviewCount(stats.reviews);
      setBusinessesPercent(stats.businessesPercent);
      setReviewsPercent(stats.reviewsPercent);
      setLimits(stats.limits);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authLoading && authUser) {
      loadData();
    }
  }, [authUser, authLoading, loadData]);

  if (authLoading || loading || subscriptionLoading) {
    return <Loading size="md" fullScreen />;
  }

  if (!authUser) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader title="דף הבית" description="נהל את העסקים שלך והביקורות שלך" />

      <SubscriptionInfo
        limits={limits}
        subscription={subscription}
        currentBusiness={businessesCount}
        currentReviews={reviewCount}
        businessesPercent={businessesPercent}
        reviewsPercent={reviewsPercent}
        planType={planType}
      />
    </PageContainer>
  );
}

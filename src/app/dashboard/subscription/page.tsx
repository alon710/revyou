"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionInfo } from "@/components/dashboard/dashboard/SubscriptionInfo";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function SubscriptionPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { subscription, planType, loading: subscriptionLoading } = useSubscription();
  const [businessesCount, setBusinessesCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [businessesPercent, setBusinessesPercent] = useState(0);
  const [reviewsPercent, setReviewsPercent] = useState(0);
  const [limits, setLimits] = useState({ businesses: 1, reviewsPerMonth: 5, autoPost: false, requireApproval: true });
  const [stripeLink, setStripeLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!authUser) return;

    try {
      setLoading(true);

      const [statsResponse, userResponse] = await Promise.all([
        fetch(`/api/users/${authUser.uid}/stats`),
        fetch(`/api/users/${authUser.uid}`),
      ]);

      if (!statsResponse.ok || !userResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const stats = await statsResponse.json();
      const userData = await userResponse.json();

      setBusinessesCount(stats.businesses);
      setReviewCount(stats.reviews);
      setBusinessesPercent(stats.businessesPercent);
      setReviewsPercent(stats.reviewsPercent);
      setLimits(stats.limits);
      setStripeLink(userData.stripeLink || null);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("שגיאה בטעינת נתונים. אנא נסה שוב מאוחר יותר.");
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authLoading && authUser) {
      loadData();
    }
  }, [authUser, authLoading, loadData]);

  const handleUpgrade = () => {
    toast.info("שדרוג מנוי יהיה זמין בקרוב");
  };

  const handleManageSubscription = () => {
    if (stripeLink) {
      try {
        const url = new URL(stripeLink);
        if (!url.hostname.includes("stripe.com")) {
          toast.error("קישור לא תקין. אנא פנה לתמיכה.");
          return;
        }
      } catch {
        toast.error("קישור לא תקין. אנא פנה לתמיכה.");
        return;
      }
      window.open(stripeLink, "_blank");
    }
  };

  if (authLoading || loading || subscriptionLoading) {
    return <Loading size="md" fullScreen />;
  }

  if (!authUser) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader title="תוכנית המנוי" description="נהל את המנוי והשימוש שלך" />

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
              שדרג תוכנית
            </Button>
          )}

          {stripeLink && planType !== "free" && (
            <Button onClick={handleManageSubscription} variant="outline" size="lg">
              <ExternalLink className="w-4 h-4 ml-2" />
              נהל מנוי
            </Button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

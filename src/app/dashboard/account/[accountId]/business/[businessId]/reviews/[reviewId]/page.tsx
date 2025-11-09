"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Business, Review } from "@/lib/types";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import { Loading } from "@/components/ui/loading";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/ui/back-button";

interface ReviewPageProps {
  params: Promise<{ accountId: string; businessId: string; reviewId: string }>;
}

export default function ReviewPage({ params }: ReviewPageProps) {
  const { accountId, businessId, reviewId } = use(params);
  const { user } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user || !accountId || !businessId || !reviewId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const businessResponse = await fetch(`/api/users/${user.uid}/accounts/${accountId}/businesses/${businessId}`);

      if (!businessResponse.ok) {
        throw new Error("העסק לא נמצא");
      }

      const { business: biz } = await businessResponse.json();
      setBusiness(biz);

      const reviewResponse = await fetch(
        `/api/users/${user.uid}/accounts/${accountId}/businesses/${businessId}/reviews/${reviewId}`
      );

      if (!reviewResponse.ok) {
        throw new Error("הביקורת לא נמצאה");
      }

      const { review: fetchedReview } = await reviewResponse.json();
      setReview(fetchedReview);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : "שגיאה בטעינת הביקורת");
    } finally {
      setLoading(false);
    }
  }, [user, accountId, businessId, reviewId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <PageContainer>
        <Loading fullScreen text="טוען ביקורת..." />
      </PageContainer>
    );
  }

  if (error || !review || !business || !user) {
    return (
      <PageContainer>
        <div className="mb-6">
          <BackButton href={`/dashboard/account/${accountId}/business/${businessId}/reviews`} />
        </div>
        <PageHeader title="ביקורת" description="פרטי ביקורת" />
        <div className="text-center text-muted-foreground py-12">{error || "הביקורת לא נמצאה"}</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <BackButton href={`/dashboard/account/${accountId}/business/${businessId}/reviews`} />
      </div>
      <PageHeader title={`ביקורת מאת ${review.name}`} description={business.name} />

      <div className="mt-6">
        <ReviewCard
          review={review}
          accountId={accountId}
          businessId={businessId}
          userId={user.uid}
          onUpdate={loadData}
        />
      </div>
    </PageContainer>
  );
}

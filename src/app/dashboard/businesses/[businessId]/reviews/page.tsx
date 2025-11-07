"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Business, Review } from "@/lib/types";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/ui/back-button";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function BusinessReviewsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user || !businessId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch business using new API
      const businessResponse = await fetch(
        `/api/users/${user.uid}/accounts/${user.selectedAccountId}/businesses/${businessId}`
      );

      if (!businessResponse.ok) {
        throw new Error("לא נמצא עסק");
      }

      const { business: biz } = await businessResponse.json();
      setBusiness(biz);

      // Fetch reviews using new API with filters
      const reviewsResponse = await fetch(
        `/api/users/${user.uid}/accounts/${biz.accountId}/businesses/${businessId}/reviews?orderBy=receivedAt&orderDirection=desc`
      );

      if (!reviewsResponse.ok) {
        throw new Error("שגיאה בטעינת ביקורות");
      }

      const { reviews: fetchedReviews } = await reviewsResponse.json();
      setReviews(fetchedReviews);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "שגיאה בטעינת ביקורות";
      console.error("Error loading data:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, businessId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <PageContainer>
        <Loading fullScreen text="טוען..." />
      </PageContainer>
    );
  }

  if (error || !business || !user) {
    return (
      <EmptyState
        title="שגיאה"
        description="שגיאה בטעינת הביקורות"
        buttonText="חזור לעסקים"
        buttonLink="/dashboard/businesses"
      />
    );
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <BackButton href="/dashboard/businesses" />
      </div>

      <PageHeader
        title={`ביקורות - ${business.name}`}
        description="כל הביקורות עבור עסק זה ממוינות מחדש לישן"
      />

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <EmptyState
            title="אין ביקורות עדיין"
            description="הביקורות יופיעו כאן ברגע שהן יגיעו מגוגל"
            buttonText="חזור לעסקים"
            buttonLink="/dashboard/businesses"
          />
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              onClick={() =>
                router.push(
                  `/dashboard/businesses/${businessId}/reviews/${review.id}`
                )
              }
              className="cursor-pointer hover:opacity-90 transition-opacity"
            >
              <ReviewCard
                review={review}
                accountId={business.accountId}
                businessId={businessId}
                userId={user.uid}
                onUpdate={fetchData}
              />
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
}

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

interface BusinessReviewsPageProps {
  params: Promise<{ accountId: string; businessId: string }>;
}

export default function BusinessReviewsPage({
  params,
}: BusinessReviewsPageProps) {
  const { accountId, businessId } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user || !businessId || !accountId) return;

    try {
      setLoading(true);
      setError(null);

      const businessResponse = await fetch(
        `/api/users/${user.uid}/accounts/${accountId}/businesses/${businessId}`
      );

      if (!businessResponse.ok) {
        throw new Error("לא נמצא עסק");
      }

      const { business: biz } = await businessResponse.json();
      setBusiness(biz);

      const reviewsResponse = await fetch(
        `/api/users/${user.uid}/accounts/${accountId}/businesses/${businessId}/reviews?orderBy=receivedAt&orderDirection=desc`
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
  }, [user, businessId, accountId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user || loading) {
    return (
      <PageContainer>
        <Loading fullScreen text="טוען ביקורות..." />
      </PageContainer>
    );
  }

  if (error || !business) {
    return (
      <PageContainer>
        <div className="mb-6">
          <BackButton
            href={`/dashboard/accounts/${accountId}/businesses/${businessId}`}
          />
        </div>
        <PageHeader title="ביקורות" description="כל הביקורות לעסק" />
        <EmptyState
          title="שגיאה בטעינת הביקורות"
          description={error || "לא נמצא עסק"}
          buttonText="חזרה לעסקים"
          buttonLink={`/dashboard/accounts/${accountId}/businesses/${businessId}`}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <BackButton
          href={`/dashboard/accounts/${accountId}/businesses/${businessId}`}
        />
      </div>

      <PageHeader
        title={`ביקורות ${business.name}`}
        description={`כל הביקורות לעסק שלך`}
      />

      <div className="space-y-4 mt-6">
        {reviews.length === 0 ? (
          <EmptyState
            title="אין עדיין ביקורות"
            description="כשיגיעו ביקורות חדשות, הן יופיעו כאן"
            buttonText="חזרה לעסקים"
            buttonLink={`/dashboard/accounts/${accountId}/businesses/${businessId}`}
          />
        ) : (
          reviews.map((review) => (
            <div key={review.id}>
              <ReviewCard
                review={review}
                accountId={accountId}
                businessId={businessId}
                userId={user.uid}
                onUpdate={fetchData}
                onClick={() =>
                  router.push(
                    `/dashboard/account/${accountId}/business/${businessId}/reviews/${review.id}`
                  )
                }
              />
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
}

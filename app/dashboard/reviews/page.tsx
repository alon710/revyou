"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useReviews } from "@/hooks/useReviews";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ReviewsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    currentBusiness,
    businesses,
    loading: businessLoading,
  } = useBusiness();
  const { reviews, loading: reviewsLoading, error, refetch } = useReviews();

  useEffect(() => {
    if (error) {
      toast.error("שגיאה בטעינת ביקורות: " + error);
    }
  }, [error]);

  const isLoading = reviewsLoading;

  if (businessLoading) {
    return (
      <PageContainer>
        <Loading fullScreen text="טוען..." />
      </PageContainer>
    );
  }

  if (businesses.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="ביקורות" description="כל הביקורות עבור העסקים שלך" />
        <EmptyState />
      </PageContainer>
    );
  }

  if (!currentBusiness) {
    return (
      <PageContainer>
        <PageHeader title="ביקורות" description="כל הביקורות עבור העסקים שלך" />
        <EmptyState />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`ביקורות - ${currentBusiness.name}`}
        description="כל הביקורות עבור עסק זה ממוינות מחדש לישן"
      />

      <div className="space-y-4">
        {isLoading && reviews.length === 0 ? (
          <Loading text="טוען ביקורות..." />
        ) : reviews.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            אין ביקורות עדיין. הביקורות של {currentBusiness.name} יופיעו כאן
            ברגע שהן יגיעו מגוגל
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              onClick={() => router.push(`/dashboard/reviews/${review.id}`)}
              className="cursor-pointer hover:opacity-90 transition-opacity"
            >
              <ReviewCard
                review={review}
                userId={user!.uid}
                businessId={currentBusiness.id}
                onUpdate={refetch}
              />
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
}

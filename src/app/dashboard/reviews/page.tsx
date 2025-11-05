"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useReviews } from "@/hooks/useReviews";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import { Loading } from "@/components/ui/loading";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";

export default function ReviewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const {
    currentBusiness,
    businesses,
    loading: businessLoading,
    selectBusiness,
  } = useBusiness();
  const { reviews, loading: reviewsLoading, error, refetch } = useReviews();

  // Handle businessId from query params (when navigating from business card)
  useEffect(() => {
    const businessId = searchParams.get("businessId");
    if (businessId && businesses.length > 0) {
      const business = businesses.find((b) => b.id === businessId);
      if (business) {
        selectBusiness(businessId);
      }
    }
  }, [searchParams, businesses, selectBusiness]);

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

  if (!currentBusiness) {
    return (
      <PageContainer>
        <PageHeader title="ביקורות" description="כל הביקורות עבור העסקים שלך" />
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            לא נבחר עסק. בחר עסק מרשימת העסקים.
          </p>
        </div>
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
          <EmptyState
            title="אין ביקורות עדיין"
            description="הביקורות יופיעו כאן ברגע שהן יגיעו מגוגל"
            buttonText="חבר עסק"
            buttonLink="/onboarding/step-2"
          />
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

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useBusinessData } from "@/contexts/BusinessDataContext";
import { useReviewData } from "@/contexts/ReviewDataContext";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/ui/back-button";

export default function ReviewPage() {
  const { user } = useAuth();
  const { business } = useBusinessData();
  const { review, refreshReview } = useReviewData();

  return (
    <PageContainer>
      <div className="mb-6">
        <BackButton href={`/dashboard/businesses/${business.id}/reviews`} />
      </div>
      <PageHeader
        title={`ביקורת מאת ${review.name}`}
        description={business.name}
      />

      <div className="mt-6">
        <ReviewCard
          review={review}
          userId={user!.uid}
          businessId={business.id}
          onUpdate={refreshReview}
        />
      </div>
    </PageContainer>
  );
}

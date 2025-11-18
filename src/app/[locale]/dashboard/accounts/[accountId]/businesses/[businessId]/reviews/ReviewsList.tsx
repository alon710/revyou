"use client";

import { useRouter } from "@/i18n/routing";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import type { Review } from "@/lib/types";

interface ReviewsListProps {
  reviews: Review[];
  accountId: string;
  businessId: string;
  userId: string;
}

export function ReviewsList({ reviews, accountId, businessId, userId }: ReviewsListProps) {
  const router = useRouter();

  const handleUpdate = () => {
    router.refresh();
  };

  const handleReviewClick = (reviewId: string) => {
    router.push(`/dashboard/accounts/${accountId}/businesses/${businessId}/reviews/${reviewId}`);
  };

  return (
    <>
      {reviews.map((review) => (
        <div key={review.id}>
          <ReviewCard
            review={review}
            accountId={accountId}
            businessId={businessId}
            userId={userId}
            onUpdate={handleUpdate}
            onClick={() => handleReviewClick(review.id)}
          />
        </div>
      ))}
    </>
  );
}

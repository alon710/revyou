"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import { getReviews } from "@/lib/actions/reviews.actions";
import { useInView } from "react-intersection-observer";
import { Loading } from "@/components/ui/loading";
import type { ReviewWithLatestGeneration } from "@/lib/db/repositories";
import { parseFiltersFromSearchParams } from "@/lib/utils/filter-utils";

interface ReviewsListProps {
  reviews: ReviewWithLatestGeneration[];
  accountId: string;
  businessId: string;
  userId: string;
}

export function ReviewsList({ reviews: initialReviews, accountId, businessId, userId }: ReviewsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reviews, setReviews] = useState<ReviewWithLatestGeneration[]>(initialReviews);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView();

  useEffect(() => {
    setReviews(initialReviews);
    setHasMore(true);
  }, [initialReviews]);

  const loadMoreReviews = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextBatch = await getReviews({
        accountId,
        businessId,
        filters: {
          ...parseFiltersFromSearchParams(Object.fromEntries(searchParams.entries())),
          limit: 10,
          offset: reviews.length,
        },
      });

      if (nextBatch.length === 0) {
        setHasMore(false);
      } else {
        setReviews((prev) => [...prev, ...nextBatch]);
      }
    } catch (error) {
      console.error("Failed to load more reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, businessId, hasMore, isLoading, reviews.length, searchParams]);

  useEffect(() => {
    if (inView) {
      loadMoreReviews();
    }
  }, [inView, loadMoreReviews]);

  const handleUpdate = () => {
    router.refresh();
  };

  const handleReviewClick = (reviewId: string) => {
    router.push(`/dashboard/accounts/${accountId}/businesses/${businessId}/reviews/${reviewId}`);
  };

  return (
    <div className="space-y-4">
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

      {hasMore && (
        <div ref={ref} className="flex justify-center py-4">
          {isLoading && <Loading size="md" />}
        </div>
      )}
    </div>
  );
}

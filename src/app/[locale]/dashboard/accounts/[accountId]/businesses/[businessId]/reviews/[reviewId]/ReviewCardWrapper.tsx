"use client";

import { useRouter } from "@/i18n/routing";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import type { Review } from "@/lib/types";

interface ReviewCardWrapperProps {
  review: Review;
  accountId: string;
  businessId: string;
  userId: string;
}

export function ReviewCardWrapper({ review, accountId, businessId, userId }: ReviewCardWrapperProps) {
  const router = useRouter();

  const handleUpdate = () => {
    router.refresh();
  };

  return (
    <ReviewCard review={review} accountId={accountId} businessId={businessId} userId={userId} onUpdate={handleUpdate} />
  );
}

"use client";

import { useRouter } from "@/i18n/routing";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import type { Review } from "@/lib/types";

interface ReviewDetailClientProps {
  review: Review;
  accountId: string;
  businessId: string;
  userId: string;
}

export function ReviewDetailClient({ review, accountId, businessId, userId }: ReviewDetailClientProps) {
  const router = useRouter();

  return (
    <ReviewCard
      review={review}
      accountId={accountId}
      businessId={businessId}
      userId={userId}
      onUpdate={() => router.refresh()}
    />
  );
}

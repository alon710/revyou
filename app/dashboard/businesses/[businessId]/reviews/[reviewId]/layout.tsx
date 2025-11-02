"use client";

import { useEffect, useState } from "react";
import { ReviewDataProvider } from "@/contexts/ReviewDataContext";

interface ReviewLayoutProps {
  children: React.ReactNode;
  params: Promise<{ businessId: string; reviewId: string }>;
}

export default function ReviewLayout({ children, params }: ReviewLayoutProps) {
  const [reviewId, setReviewId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setReviewId(p.reviewId));
  }, [params]);

  if (!reviewId) {
    return null;
  }

  return (
    <ReviewDataProvider reviewId={reviewId}>{children}</ReviewDataProvider>
  );
}

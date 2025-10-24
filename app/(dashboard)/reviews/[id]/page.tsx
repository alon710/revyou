"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getReview } from "@/lib/firebase/reviews";
import { getBusiness } from "@/lib/firebase/businesses";
import { Review, Business } from "@/types/database";
import { ReviewCard } from "@/components/dashboard/ReviewCard";
import { BackButton } from "@/components/ui/back-button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

/**
 * Single Review Detail Page
 * Displays full details for a single review
 */
export default function ReviewDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [review, setReview] = useState<Review | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reviewId = params.id as string;

  const loadReview = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load review
      const reviewData = await getReview(reviewId);

      if (!reviewData) {
        setError("הביקורת לא נמצאה");
        return;
      }

      // Load business
      const businessData = await getBusiness(reviewData.businessId);

      if (!businessData) {
        setError("העסק לא נמצא");
        return;
      }

      // Verify ownership
      if (businessData.userId !== user?.uid) {
        setError("אין הרשאה לצפות בביקורת זו");
        return;
      }

      setReview(reviewData);
      setBusiness(businessData);
    } catch (error) {
      console.error("Error loading review:", error);
      setError("שגיאה בטעינת הביקורת");
    } finally {
      setIsLoading(false);
    }
  }, [reviewId, user]);

  useEffect(() => {
    if (user && reviewId) {
      loadReview();
    }
  }, [user, reviewId, loadReview]);

  const handleUpdate = () => {
    loadReview();
  };

  if (!user) {
    return (
      <PageContainer>
        <p>נא להתחבר כדי לצפות בביקורת</p>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[400px] w-full" />
      </PageContainer>
    );
  }

  if (error || !review || !business) {
    return (
      <PageContainer>
        <BackButton href="/reviews" label="חזרה לביקורות" />
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            {error || "הביקורת לא נמצאה"}
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackButton href="/reviews" label="חזרה לביקורות" className="mb-6" />

      <PageHeader title={business.name} description="פרטי ביקורת" />

      {/* Business Info */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">עסק</p>
        <h2 className="text-xl font-semibold">{business.name}</h2>
      </div>

      {/* Review Card */}
      <ReviewCard review={review} onUpdate={handleUpdate} />

      {/* Additional Info */}
      <div className="rounded-lg border p-4 space-y-2">
        <h3 className="font-semibold">פרטים נוספים</h3>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">מזהה ביקורת:</span>
            <span className="font-mono text-xs">{review.googleReviewId}</span>
          </div>
          {review.aiReplyGeneratedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">תגובה נוצרה:</span>
              <span>
                {review.aiReplyGeneratedAt
                  .toDate?.()
                  .toLocaleDateString("he-IL")}
              </span>
            </div>
          )}
          {review.postedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">תאריך פרסום:</span>
              <span>
                {review.postedAt.toDate?.().toLocaleDateString("he-IL")}
              </span>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

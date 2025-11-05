"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Review } from "@/types/database";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import { Loading } from "@/components/ui/loading";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/ui/back-button";

interface ReviewPageProps {
  params: Promise<{ reviewId: string }>;
}

export default function ReviewPage({ params }: ReviewPageProps) {
  const { user } = useAuth();
  const { currentBusiness, loading: businessLoading } = useBusiness();
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setReviewId(p.reviewId));
  }, [params]);

  useEffect(() => {
    async function loadReview() {
      if (!db || !currentBusiness || !user || !reviewId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const reviewRef = doc(
          db,
          "users",
          user.uid,
          "businesses",
          currentBusiness.id,
          "reviews",
          reviewId
        );

        const reviewSnap = await getDoc(reviewRef);

        if (reviewSnap.exists()) {
          setReview({
            id: reviewSnap.id,
            ...reviewSnap.data(),
          } as Review);
        } else {
          setError("הביקורת לא נמצאה");
        }
      } catch (err) {
        console.error("Error loading review:", err);
        setError("שגיאה בטעינת הביקורת");
      } finally {
        setIsLoading(false);
      }
    }

    if (!businessLoading && reviewId) {
      loadReview();
    }
  }, [currentBusiness, user, reviewId, businessLoading]);

  const handleUpdate = async () => {
    if (!db || !currentBusiness || !user || !reviewId) return;

    try {
      const reviewRef = doc(
        db,
        "users",
        user.uid,
        "businesses",
        currentBusiness.id,
        "reviews",
        reviewId
      );

      const reviewSnap = await getDoc(reviewRef);

      if (reviewSnap.exists()) {
        setReview({
          id: reviewSnap.id,
          ...reviewSnap.data(),
        } as Review);
      }
    } catch (err) {
      console.error("Error reloading review:", err);
    }
  };

  if (businessLoading || isLoading) {
    return (
      <PageContainer>
        <Loading fullScreen text="טוען ביקורת..." />
      </PageContainer>
    );
  }

  if (error || !review) {
    return (
      <PageContainer>
        <div className="mb-6">
          <BackButton href="/reviews" />
        </div>
        <PageHeader title="ביקורת" description="פרטי ביקורת" />
        <div className="text-center text-muted-foreground py-12">
          {error || "הביקורת לא נמצאה"}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <BackButton href="/reviews" />
      </div>
      <PageHeader
        title={`ביקורת מאת ${review.name}`}
        description={currentBusiness?.name}
      />

      <div className="mt-6">
        <ReviewCard
          review={review}
          userId={user!.uid}
          businessId={currentBusiness!.id}
          onUpdate={handleUpdate}
        />
      </div>
    </PageContainer>
  );
}

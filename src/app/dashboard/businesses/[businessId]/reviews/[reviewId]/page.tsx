"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getBusinessById } from "@/lib/firebase/business";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Business, Review } from "@/types/database";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import { Loading } from "@/components/ui/loading";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/ui/back-button";

interface ReviewPageProps {
  params: Promise<{ businessId: string; reviewId: string }>;
}

export default function ReviewPage({ params }: ReviewPageProps) {
  const { businessId, reviewId } = use(params);
  const { user } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user || !businessId || !reviewId) {
      setLoading(false);
      return;
    }

    if (!db) {
      setError("שגיאה באתחול המערכת");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch business details
      const biz = await getBusinessById(user.uid, businessId);
      if (!biz) {
        setError("העסק לא נמצא");
        return;
      }
      setBusiness(biz);

      // Fetch review
      const reviewRef = doc(
        db,
        "users",
        user.uid,
        "accounts",
        biz.accountId,
        "businesses",
        businessId,
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
      console.error("Error loading data:", err);
      setError("שגיאה בטעינת הביקורת");
    } finally {
      setLoading(false);
    }
  }, [user, businessId, reviewId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <PageContainer>
        <Loading fullScreen text="טוען ביקורת..." />
      </PageContainer>
    );
  }

  if (error || !review || !business || !user) {
    return (
      <PageContainer>
        <div className="mb-6">
          <BackButton href={`/dashboard/businesses/${businessId}/reviews`} />
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
        <BackButton href={`/dashboard/businesses/${businessId}/reviews`} />
      </div>
      <PageHeader
        title={`ביקורת מאת ${review.name}`}
        description={business.name}
      />

      <div className="mt-6">
        <ReviewCard
          review={review}
          accountId={business.accountId}
          businessId={businessId}
          userId={user.uid}
          onUpdate={loadData}
        />
      </div>
    </PageContainer>
  );
}

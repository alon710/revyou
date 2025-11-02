"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Review } from "@/types/database";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useRouter } from "next/navigation";

export default function ReviewsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    currentBusiness,
    businesses,
    loading: businessLoading,
  } = useBusiness();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    if (!db || !currentBusiness || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const q = query(
        collection(
          db,
          "users",
          user.uid,
          "businesses",
          currentBusiness.id,
          "reviews"
        ),
        orderBy("receivedAt", "desc")
      );

      const snapshot = await getDocs(q);

      const fetchedReviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];

      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentBusiness, user]);

  useEffect(() => {
    if (!businessLoading) {
      loadReviews();
    }
  }, [businessLoading, loadReviews]);

  const handleUpdate = () => {
    loadReviews();
  };

  if (businessLoading) {
    return (
      <PageContainer>
        <Loading fullScreen text="טוען..." />
      </PageContainer>
    );
  }

  if (businesses.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="ביקורות" description="כל הביקורות עבור העסקים שלך" />
        <EmptyState />
      </PageContainer>
    );
  }

  if (!currentBusiness) {
    return (
      <PageContainer>
        <PageHeader title="ביקורות" description="כל הביקורות עבור העסקים שלך" />
        <EmptyState />
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
          <div className="text-center text-muted-foreground py-12">
            אין ביקורות עדיין. הביקורות של {currentBusiness.name} יופיעו כאן
            ברגע שהן יגיעו מגוגל
          </div>
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
                onUpdate={handleUpdate}
              />
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Review } from "@/types/database";
import { ReviewCard } from "@/components/dashboard/ReviewCard";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ReviewsPage() {
  const { user } = useAuth();
  const {
    currentLocation,
    locations,
    loading: businessLoading,
  } = useLocation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    if (!db || !currentLocation || !user) {
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
          "locations",
          currentLocation.id,
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
  }, [currentLocation, user]);

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

  if (locations.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="ביקורות" description="כל הביקורות עבור העסקים שלך" />
        <EmptyState />
      </PageContainer>
    );
  }

  if (!currentLocation) {
    return (
      <PageContainer>
        <PageHeader title="ביקורות" description="כל הביקורות עבור העסקים שלך" />
        <div className="text-center text-muted-foreground py-12">
          בחר עסק מהתפריט למעלה כדי לראות את הביקורות שלו
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`ביקורות - ${currentLocation.name}`}
        description="כל הביקורות עבור עסק זה ממוינות מחדש לישן"
      />

      <div className="space-y-4">
        {isLoading && reviews.length === 0 ? (
          <Loading text="טוען ביקורות..." />
        ) : reviews.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            אין ביקורות עדיין. הביקורות של {currentLocation.name} יופיעו כאן
            ברגע שהן יגיעו מגוגל
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              userId={user!.uid}
              businessId={currentLocation.id}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </div>
    </PageContainer>
  );
}

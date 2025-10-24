"use client";

import { useState, useEffect, useCallback } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Review } from "@/types/database";
import { ReviewCard } from "@/components/dashboard/ReviewCard";
import { Loading } from "@/components/ui/loading";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

/**
 * Reviews Page
 * Shows reviews for the currently selected business
 */
export default function ReviewsPage() {
  const {
    currentBusiness,
    businesses,
    loading: businessLoading,
  } = useBusiness();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    if (!db || !currentBusiness) return;

    try {
      setIsLoading(true);

      // Build query - fetch all reviews for this business
      const q = query(
        collection(db, "reviews"),
        where("businessId", "==", currentBusiness.id),
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
  }, [currentBusiness]);

  // Load reviews when business is selected
  useEffect(() => {
    if (currentBusiness && !businessLoading) {
      loadReviews();
    }
  }, [currentBusiness, businessLoading, loadReviews]);

  const handleUpdate = () => {
    loadReviews();
  };

  // Empty State - No businesses connected
  if (!businessLoading && businesses.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="ביקורות" description="כל הביקורות עבור העסקים שלך" />
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">אין עסקים מחוברים</h3>
          <p className="text-muted-foreground max-w-sm">
            חבר עסק כדי להתחיל לקבל ביקורות
          </p>
        </div>
      </PageContainer>
    );
  }

  // No business selected - Show selection prompt
  if (!businessLoading && !currentBusiness) {
    return (
      <PageContainer>
        <PageHeader title="ביקורות" description="כל הביקורות עבור העסקים שלך" />
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">בחר עסק</h3>
          <p className="text-muted-foreground max-w-sm">
            בחר עסק מהתפריט למעלה כדי לראות את הביקורות שלו
          </p>
        </div>
      </PageContainer>
    );
  }

  // Loading state
  if (businessLoading) {
    return (
      <PageContainer>
        <Loading fullScreen text="טוען עסקים..." />
      </PageContainer>
    );
  }

  // Show reviews for selected business
  return (
    <PageContainer>
      <PageHeader
        title={`ביקורות - ${currentBusiness?.name}`}
        description="כל הביקורות עבור עסק זה ממוינות מחדש לישן"
      />

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading && reviews.length === 0 ? (
          // Loading State
          <Loading text="טוען ביקורות..." />
        ) : reviews.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">אין ביקורות עדיין</h3>
            <p className="text-muted-foreground max-w-sm">
              הביקורות של {currentBusiness?.name} יופיעו כאן ברגע שהן יגיעו
              מגוגל
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessData } from "@/contexts/BusinessDataContext";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Review } from "@/types/database";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import { Loading } from "@/components/ui/loading";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useRouter } from "next/navigation";

export default function ReviewsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { business } = useBusinessData();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    if (!db || !business || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const q = query(
        collection(db, "users", user.uid, "businesses", business.id, "reviews"),
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
  }, [business, user]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleUpdate = () => {
    loadReviews();
  };

  return (
    <PageContainer>
      <PageHeader
        title={`ביקורות - ${business.name}`}
        description="כל הביקורות עבור עסק זה ממוינות מחדש לישן"
      />

      <div className="space-y-4">
        {isLoading && reviews.length === 0 ? (
          <Loading text="טוען ביקורות..." />
        ) : reviews.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            אין ביקורות עדיין. הביקורות של {business.name} יופיעו כאן ברגע שהן
            יגיעו מגוגל
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              onClick={() =>
                router.push(
                  `/dashboard/businesses/${business.id}/reviews/${review.id}`
                )
              }
              className="cursor-pointer hover:opacity-90 transition-opacity"
            >
              <ReviewCard
                review={review}
                userId={user!.uid}
                businessId={business.id}
                onUpdate={handleUpdate}
              />
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
}

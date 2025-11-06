"use client";

import { use, useEffect, useState, useCallback } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { getBusinessById } from "@/lib/firebase/business";
import type { Business, Review } from "@/types/database";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/ui/back-button";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { notFound } from "next/navigation";

export default function BusinessReviewsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user || !businessId) return;

    try {
      setLoading(true);
      setError(null);

      const biz = await getBusinessById(user.uid, businessId);
      if (!biz) {
        setError("לא נמצא עסק");
        return;
      }
      setBusiness(biz);

      const q = query(
        collection(
          db,
          "users",
          user.uid,
          "accounts",
          biz.accountId,
          "businesses",
          businessId,
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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "שגיאה בטעינת ביקורות";
      console.error("Error loading data:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, businessId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <PageContainer>
        <Loading fullScreen text="טוען..." />
      </PageContainer>
    );
  }

  if (error || !business) {
    notFound();
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <BackButton href="/dashboard/businesses" />
      </div>

      <PageHeader
        title={`ביקורות - ${business.name}`}
        description="כל הביקורות עבור עסק זה ממוינות מחדש לישן"
      />

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <EmptyState
            title="אין ביקורות עדיין"
            description="הביקורות יופיעו כאן ברגע שהן יגיעו מגוגל"
            buttonText="חזור לעסקים"
            buttonLink="/dashboard/businesses"
          />
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              onClick={() =>
                router.push(
                  `/dashboard/businesses/${businessId}/reviews/${review.id}`
                )
              }
              className="cursor-pointer hover:opacity-90 transition-opacity"
            >
              <ReviewCard
                review={review}
                accountId={business.accountId}
                businessId={businessId}
                userId={user.uid}
                onUpdate={fetchData}
              />
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
}

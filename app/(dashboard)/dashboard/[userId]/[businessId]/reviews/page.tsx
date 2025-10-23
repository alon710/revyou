"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useRouter, useParams } from "next/navigation";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Review } from "@/types/database";
import { ReviewCard } from "@/components/dashboard/ReviewCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ChevronLeft, Building2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

/**
 * Business-Scoped Reviews Page
 * Shows reviews for the currently selected business
 */
export default function BusinessReviewsPage() {
  const { user } = useAuth();
  const { currentBusiness, loading: businessLoading } = useBusiness();
  const router = useRouter();
  const params = useParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Verify params match context
  useEffect(() => {
    if (!user || businessLoading) return;

    // Verify userId matches
    if (params.userId !== user.uid) {
      router.push("/businesses");
      return;
    }

    // If no business selected or wrong business, redirect
    if (!currentBusiness) {
      router.push("/businesses");
      return;
    }

    if (params.businessId !== currentBusiness.id) {
      router.push(`/dashboard/${user.uid}/${currentBusiness.id}/reviews`);
      return;
    }
  }, [user, currentBusiness, businessLoading, params, router]);

  const loadReviews = useCallback(
    async (loadMore = false) => {
      if (!db || !currentBusiness) return;

      try {
        setIsLoading(true);

        // Build query - fetch reviews for this business only
        let q = query(
          collection(db, "reviews"),
          where("businessId", "==", currentBusiness.id),
          orderBy("receivedAt", "desc"),
          limit(20)
        );

        // If loading more, start after last document
        if (loadMore && lastDoc) {
          q = query(
            collection(db, "reviews"),
            where("businessId", "==", currentBusiness.id),
            orderBy("receivedAt", "desc"),
            startAfter(lastDoc),
            limit(20)
          );
        }

        const snapshot = await getDocs(q);

        const fetchedReviews = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Review[];

        if (loadMore) {
          setReviews((prev) => [...prev, ...fetchedReviews]);
        } else {
          setReviews(fetchedReviews);
        }

        setHasMore(snapshot.docs.length === 20);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setIsLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [currentBusiness]
  );

  // Load reviews when business is selected
  useEffect(() => {
    if (currentBusiness && !businessLoading) {
      loadReviews(false);
    }
  }, [currentBusiness, businessLoading, loadReviews]);

  const handleLoadMore = () => {
    loadReviews(true);
  };

  const handleUpdate = () => {
    loadReviews(false);
  };

  if (businessLoading || !currentBusiness) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">טוען עסק...</p>
        </div>
      </div>
    );
  }

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title={`ביקורות - ${currentBusiness.name}`}
        description="כל הביקורות עבור עסק זה ממוינות מחדש לישן"
      />

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading && reviews.length === 0 ? (
          // Loading State
          <>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[300px] w-full" />
            ))}
          </>
        ) : reviews.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">אין ביקורות עדיין</h3>
            <p className="text-muted-foreground max-w-sm">
              הביקורות של {currentBusiness.name} יופיעו כאן ברגע שהן יגיעו מגוגל
            </p>
          </div>
        ) : (
          <>
            {/* Reviews */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>

            {/* Pagination */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  disabled={isLoading}
                >
                  {isLoading ? "טוען..." : "טען עוד"}
                  <ChevronLeft className="mr-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Results Count */}
            <div className="text-center text-sm text-muted-foreground">
              מציג {reviews.length} ביקורות
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}

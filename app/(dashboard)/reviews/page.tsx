"use client";

import { useState, useEffect, useCallback } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
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
import { MessageSquare, ChevronLeft, Building2, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";

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
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

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
    },
    [currentBusiness, lastDoc]
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

  // Empty State - No businesses connected
  if (!businessLoading && businesses.length === 0) {
    return (
      <PageContainer maxWidth="7xl">
        <PageHeader title="ביקורות" description="כל הביקורות עבור העסקים שלך" />
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">אין עסקים מחוברים</h3>
          <p className="text-muted-foreground max-w-sm mb-4">
            חבר עסק כדי להתחיל לקבל ביקורות
          </p>
          <Button asChild>
            <Link href="/businesses/connect">
              <Plus className="ml-2 h-5 w-5" />
              חבר עסק
            </Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  // No business selected - Show selection prompt
  if (!businessLoading && !currentBusiness) {
    return (
      <PageContainer maxWidth="7xl">
        <PageHeader title="ביקורות" description="כל הביקורות עבור העסקים שלך" />
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
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
      <PageContainer maxWidth="7xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-full" />
          ))}
        </div>
      </PageContainer>
    );
  }

  // Show reviews for selected business
  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title={`ביקורות - ${currentBusiness?.name}`}
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
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">אין ביקורות עדיין</h3>
            <p className="text-muted-foreground max-w-sm">
              הביקורות של {currentBusiness?.name} יופיעו כאן ברגע שהן יגיעו
              מגוגל
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

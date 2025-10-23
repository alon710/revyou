"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserBusinesses } from "@/lib/firebase/businesses";
import { collection, query, where, orderBy, limit, startAfter, getDocs, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Business, Review } from "@/types/database";
import { ReviewCard } from "@/components/dashboard/ReviewCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ChevronLeft } from "lucide-react";

/**
 * Reviews List Page
 * Simple list of all reviews with lazy loading
 */
export default function ReviewsPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Fetch businesses and reviews on mount
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load businesses
      const userBusinesses = await getUserBusinesses(user.uid);
      setBusinesses(userBusinesses);

      // If user has businesses, load reviews
      if (userBusinesses.length > 0) {
        await loadReviews(userBusinesses.map(b => b.id));
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setIsLoading(false);
    }
  };

  const loadReviews = async (businessIds: string[], loadMore = false) => {
    if (!db) return;

    try {
      setIsLoading(true);

      // Build query - fetch all reviews for user's businesses, newest first
      let q = query(
        collection(db, "reviews"),
        where("businessId", "in", businessIds.slice(0, 10)), // Firestore 'in' limit is 10
        orderBy("createdAt", "desc"),
        limit(20)
      );

      // If loading more, start after last document
      if (loadMore && lastDoc) {
        q = query(
          collection(db, "reviews"),
          where("businessId", "in", businessIds.slice(0, 10)),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(20)
        );
      }

      const snapshot = await getDocs(q);

      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];

      if (loadMore) {
        setReviews(prev => [...prev, ...fetchedReviews]);
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
  };

  const handleLoadMore = () => {
    if (businesses.length > 0) {
      loadReviews(businesses.map(b => b.id), true);
    }
  };

  const handleUpdate = () => {
    if (businesses.length > 0) {
      loadReviews(businesses.map(b => b.id));
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <p>נא להתחבר כדי לצפות בביקורות</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ביקורות</h1>
          <p className="text-muted-foreground">כל הביקורות שלך ממוינות מחדש לישן</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
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
              {businesses.length === 0
                ? "חבר עסק כדי להתחיל לקבל ביקורות"
                : "הביקורות שלך יופיעו כאן ברגע שהן יגיעו מגוגל"}
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
                <Button onClick={handleLoadMore} variant="outline" disabled={isLoading}>
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
    </div>
  );
}

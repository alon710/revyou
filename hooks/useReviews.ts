import { useState, useEffect, useCallback } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Review } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";

interface UseReviewsReturn {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage reviews for the current business
 * Automatically refetches when business or user changes
 */
export function useReviews(): UseReviewsReturn {
  const { user } = useAuth();
  const {
    currentAccount,
    currentBusiness,
    loading: businessLoading,
  } = useBusiness();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!db || !currentBusiness || !currentAccount || !user) {
      setReviews([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(
          db,
          "users",
          user.uid,
          "accounts",
          currentAccount.id,
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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error loading reviews";
      console.error("Error loading reviews:", err);
      setError(errorMessage);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness, currentAccount, user]);

  useEffect(() => {
    if (!businessLoading) {
      fetchReviews();
    }
  }, [businessLoading, fetchReviews]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
  };
}

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { startOfMonth } from "date-fns";
import type { PlanLimits } from "@/lib/stripe/entitlements";
import { getAllUserBusinesses } from "@/lib/firebase/business";

interface UseUserStatsReturn {
  reviewCount: number;
  businessCount: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Calculate usage percentages for businesses and reviews
 */
export function getUsagePercentages(
  currentBusiness: number,
  currentReviews: number,
  limits: PlanLimits
): {
  businessesPercent: number;
  reviewsPercent: number;
} {
  const businessesPercent = Math.min(
    100,
    Math.round((currentBusiness / limits.businesses) * 100)
  );

  const reviewsPercent = Math.min(
    100,
    Math.round((currentReviews / limits.reviewsPerMonth) * 100)
  );

  return {
    businessesPercent,
    reviewsPercent,
  };
}

export function useUserStats(): UseUserStatsReturn {
  const { user } = useAuth();
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [businessCount, setBusinessCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user || !db) {
      setReviewCount(0);
      setBusinessCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userId = user.uid;
      const startDate = startOfMonth(new Date());

      const allBusinesses = await getAllUserBusinesses(userId);
      setBusinessCount(allBusinesses.length);

      const accountsRef = collection(db, "users", userId, "accounts");
      const accountsSnapshot = await getDocs(accountsRef);

      if (accountsSnapshot.docs.length === 0) {
        setReviewCount(0);
        setLoading(false);
        return;
      }

      let totalReviewCount = 0;

      for (const accountDoc of accountsSnapshot.docs) {
        const accountId = accountDoc.id;

        const businessesQuery = query(
          collection(db, "users", userId, "accounts", accountId, "businesses"),
          where("connected", "==", true)
        );
        const businessesSnapshot = await getDocs(businessesQuery);

        for (const businessDoc of businessesSnapshot.docs) {
          const reviewsQuery = query(
            collection(
              db,
              "users",
              userId,
              "accounts",
              accountId,
              "businesses",
              businessDoc.id,
              "reviews"
            ),
            where("receivedAt", ">=", Timestamp.fromDate(startDate))
          );
          const snapshot = await getDocs(reviewsQuery);
          totalReviewCount += snapshot.size;
        }
      }

      setReviewCount(totalReviewCount);
    } catch (err) {
      console.error("Error getting user stats:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch user stats")
      );
      setReviewCount(0);
      setBusinessCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    reviewCount,
    businessCount,
    loading,
    error,
    refetch: fetchStats,
  };
}

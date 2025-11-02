"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessData } from "./BusinessDataContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Review } from "@/types/database";

interface ReviewDataContextType {
  review: Review;
  refreshReview: () => Promise<void>;
}

const ReviewDataContext = createContext<ReviewDataContextType | undefined>(
  undefined
);

export function useReviewData() {
  const context = useContext(ReviewDataContext);
  if (context === undefined) {
    throw new Error("useReviewData must be used within a ReviewDataProvider");
  }
  return context;
}

interface ReviewDataProviderProps {
  children: ReactNode;
  reviewId: string;
}

export function ReviewDataProvider({
  children,
  reviewId,
}: ReviewDataProviderProps) {
  const { user } = useAuth();
  const { business } = useBusinessData();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReview = useCallback(async () => {
    if (!db || !business || !user || !reviewId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const reviewRef = doc(
        db,
        "users",
        user.uid,
        "businesses",
        business.id,
        "reviews",
        reviewId
      );

      const reviewSnap = await getDoc(reviewRef);

      if (reviewSnap.exists()) {
        setReview({
          id: reviewSnap.id,
          ...reviewSnap.data(),
        } as Review);
      } else {
        setError("הביקורת לא נמצאה");
        setReview(null);
      }
    } catch (err) {
      console.error("Error loading review:", err);
      setError("שגיאה בטעינת הביקורת");
      setReview(null);
    } finally {
      setLoading(false);
    }
  }, [business, user, reviewId]);

  useEffect(() => {
    if (user && business && reviewId) {
      loadReview();
    }
  }, [user, business, reviewId, loadReview]);

  const refreshReview = async () => {
    await loadReview();
  };

  if (loading) {
    return null;
  }

  if (error || !review) {
    return null;
  }

  return (
    <ReviewDataContext.Provider value={{ review, refreshReview }}>
      {children}
    </ReviewDataContext.Provider>
  );
}

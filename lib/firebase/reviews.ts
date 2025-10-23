import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";
import { Review, ReplyStatus } from "@/types/database";
import {
  reviewSchema,
  reviewCreateSchema,
  reviewUpdateSchema,
  ReviewCreateInput,
  ReviewUpdateInput,
} from "@/lib/validation/database";

/**
 * Review Database Operations
 * All CRUD operations for the reviews collection
 */

export interface ReviewFilters {
  status?: ReplyStatus;
  rating?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ReviewsResult {
  reviews: Review[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Get reviews for a business with optional filters and pagination
 * @param businessId - Business ID
 * @param filters - Optional filters (status, rating, date range)
 * @param limit - Number of reviews to fetch (default: 20)
 * @param lastDoc - Last document for pagination
 * @returns Reviews and pagination info
 */
export async function getReviewsByBusiness(
  businessId: string,
  filters?: ReviewFilters,
  limit: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<ReviewsResult> {
  if (!db) {
    console.error("Firestore not initialized");
    return { reviews: [], lastDoc: null, hasMore: false };
  }

  try {
    const reviewsRef = collection(db, "reviews");
    const constraints: QueryConstraint[] = [
      where("businessId", "==", businessId),
    ];

    // Add filters
    if (filters?.status) {
      constraints.push(where("replyStatus", "==", filters.status));
    }
    if (filters?.rating) {
      constraints.push(where("rating", "==", filters.rating));
    }
    if (filters?.startDate) {
      constraints.push(
        where("receivedAt", ">=", Timestamp.fromDate(filters.startDate))
      );
    }
    if (filters?.endDate) {
      constraints.push(
        where("receivedAt", "<=", Timestamp.fromDate(filters.endDate))
      );
    }

    // Order by receivedAt descending
    constraints.push(orderBy("receivedAt", "desc"));

    // Pagination
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    // Limit + 1 to check if there are more
    constraints.push(firestoreLimit(limit + 1));

    const q = query(reviewsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const reviews: Review[] = [];
    let hasMore = false;
    let lastDocument: DocumentSnapshot | null = null;

    let index = 0;
    querySnapshot.forEach((doc) => {
      if (index < limit) {
        const data = doc.data();
        try {
          const validated = reviewSchema.parse({ id: doc.id, ...data });
          reviews.push(validated as Review);
          lastDocument = doc;
        } catch (error) {
          console.error("Invalid review data:", doc.id, error);
        }
      } else {
        hasMore = true;
      }
      index++;
    });

    return { reviews, lastDoc: lastDocument, hasMore };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw new Error("לא ניתן לטעון את הביקורות");
  }
}

/**
 * Get a single review by ID
 * @param reviewId - Review ID
 * @returns Review data or null if not found
 */
export async function getReview(reviewId: string): Promise<Review | null> {
  if (!db) {
    console.error("Firestore not initialized");
    return null;
  }

  try {
    const reviewRef = doc(db, "reviews", reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (reviewSnap.exists()) {
      const data = reviewSnap.data();
      const validated = reviewSchema.parse({ id: reviewSnap.id, ...data });
      return validated as Review;
    }

    return null;
  } catch (error) {
    console.error("Error fetching review:", error);
    throw new Error("לא ניתן לטעון את הביקורת");
  }
}

/**
 * Create a new review
 * @param data - Review data (without id)
 * @returns Created review with ID
 */
export async function createReview(
  data: Omit<ReviewCreateInput, "receivedAt" | "wasEdited" | "replyStatus">
): Promise<Review> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const reviewData = {
      ...data,
      receivedAt: serverTimestamp(),
      replyStatus: "pending" as ReplyStatus,
      wasEdited: false,
    };

    // Validate before creating
    reviewCreateSchema.parse(reviewData);

    const reviewsRef = collection(db, "reviews");
    const docRef = await addDoc(reviewsRef, reviewData);

    // Return the created review
    return (await getReview(docRef.id)) as Review;
  } catch (error) {
    console.error("Error creating review:", error);
    throw new Error("לא ניתן ליצור ביקורת חדשה");
  }
}

/**
 * Update review reply (AI generated or edited)
 * @param reviewId - Review ID
 * @param reply - Reply text
 * @param isEdited - Whether this is a user edit
 * @returns Updated review
 */
export async function updateReviewReply(
  reviewId: string,
  reply: string,
  isEdited: boolean = false
): Promise<Review> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const reviewRef = doc(db, "reviews", reviewId);
    const updateData: Record<string, unknown> = {
      aiReply: reply,
      aiReplyGeneratedAt: serverTimestamp(),
    };

    if (isEdited) {
      updateData.wasEdited = true;
      updateData.editedReply = reply;
    }

    await updateDoc(reviewRef, updateData);

    // Return the updated review
    return (await getReview(reviewId)) as Review;
  } catch (error) {
    console.error("Error updating review reply:", error);
    throw new Error("לא ניתן לעדכן את התגובה");
  }
}

/**
 * Approve a reply for posting
 * @param reviewId - Review ID
 * @returns Updated review
 */
export async function approveReply(reviewId: string): Promise<Review> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, { replyStatus: "approved" });

    // Return the updated review
    return (await getReview(reviewId)) as Review;
  } catch (error) {
    console.error("Error approving reply:", error);
    throw new Error("לא ניתן לאשר את התגובה");
  }
}

/**
 * Reject a reply
 * @param reviewId - Review ID
 * @returns Updated review
 */
export async function rejectReply(reviewId: string): Promise<Review> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, { replyStatus: "rejected" });

    // Return the updated review
    return (await getReview(reviewId)) as Review;
  } catch (error) {
    console.error("Error rejecting reply:", error);
    throw new Error("לא ניתן לדחות את התגובה");
  }
}

/**
 * Mark a review as posted with the reply that was posted
 * @param reviewId - Review ID
 * @param postedReply - The actual reply that was posted
 * @param postedBy - User ID who posted
 * @returns Updated review
 */
export async function markAsPosted(
  reviewId: string,
  postedReply: string,
  postedBy: string
): Promise<Review> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, {
      replyStatus: "posted",
      postedReply,
      postedAt: serverTimestamp(),
      postedBy,
    });

    // Return the updated review
    return (await getReview(reviewId)) as Review;
  } catch (error) {
    console.error("Error marking as posted:", error);
    throw new Error("לא ניתן לסמן את התגובה כפורסמה");
  }
}

/**
 * Mark a review reply as failed
 * @param reviewId - Review ID
 * @returns Updated review
 */
export async function markAsFailed(reviewId: string): Promise<Review> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, { replyStatus: "failed" });

    // Return the updated review
    return (await getReview(reviewId)) as Review;
  } catch (error) {
    console.error("Error marking as failed:", error);
    throw new Error("לא ניתן לעדכן את סטטוס התגובה");
  }
}

/**
 * Update review data
 * @param reviewId - Review ID
 * @param data - Partial review data to update
 * @returns Updated review
 */
export async function updateReview(
  reviewId: string,
  data: ReviewUpdateInput
): Promise<Review> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    // Validate update data
    const validatedData = reviewUpdateSchema.parse(data);

    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, validatedData);

    // Return the updated review
    return (await getReview(reviewId)) as Review;
  } catch (error) {
    console.error("Error updating review:", error);
    throw new Error("לא ניתן לעדכן את הביקורת");
  }
}

/**
 * Get review statistics for a business
 * @param businessId - Business ID
 * @returns Statistics object
 */
export async function getReviewStats(businessId: string): Promise<{
  total: number;
  pending: number;
  approved: number;
  posted: number;
  rejected: number;
  failed: number;
  averageRating: number;
}> {
  if (!db) {
    return {
      total: 0,
      pending: 0,
      approved: 0,
      posted: 0,
      rejected: 0,
      failed: 0,
      averageRating: 0,
    };
  }

  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, where("businessId", "==", businessId));
    const querySnapshot = await getDocs(q);

    let total = 0;
    let pending = 0;
    let approved = 0;
    let posted = 0;
    let rejected = 0;
    let failed = 0;
    let totalRating = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      total++;
      totalRating += data.rating || 0;

      switch (data.replyStatus) {
        case "pending":
          pending++;
          break;
        case "approved":
          approved++;
          break;
        case "posted":
          posted++;
          break;
        case "rejected":
          rejected++;
          break;
        case "failed":
          failed++;
          break;
      }
    });

    const averageRating = total > 0 ? totalRating / total : 0;

    return {
      total,
      pending,
      approved,
      posted,
      rejected,
      failed,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    };
  } catch (error) {
    console.error("Error fetching review stats:", error);
    throw new Error("לא ניתן לטעון את סטטיסטיקת הביקורות");
  }
}

/**
 * Get recent reviews for a business
 * @param businessId - Business ID
 * @param limit - Number of reviews to fetch (default: 5)
 * @returns Array of recent reviews
 */
export async function getRecentReviews(
  businessId: string,
  limit: number = 5
): Promise<Review[]> {
  const result = await getReviewsByBusiness(businessId, undefined, limit);
  return result.reviews;
}

/**
 * Get pending reviews for a business (require approval)
 * @param businessId - Business ID
 * @returns Array of pending reviews
 */
export async function getPendingReviews(businessId: string): Promise<Review[]> {
  const result = await getReviewsByBusiness(
    businessId,
    { status: "pending" },
    100 // Get all pending
  );
  return result.reviews;
}

/**
 * Check if a review with a specific Google Review ID already exists
 * @param googleReviewId - Google Review ID
 * @returns True if exists, false otherwise
 */
export async function reviewExists(googleReviewId: string): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(
      reviewsRef,
      where("googleReviewId", "==", googleReviewId),
      firestoreLimit(1)
    );
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking review existence:", error);
    return false;
  }
}

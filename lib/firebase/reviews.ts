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
 * @param userId - User ID
 * @param businessId - Business ID
 * @param filters - Optional filters (status, rating, date range)
 * @param limit - Number of reviews to fetch (default: 20)
 * @param lastDoc - Last document for pagination
 * @returns Reviews and pagination info
 */
export async function getReviewsByBusiness(
  userId: string,
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
    const reviewsRef = collection(
      db,
      "users",
      userId,
      "businesses",
      businessId,
      "reviews"
    );
    const constraints: QueryConstraint[] = [];

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
 * @param userId - User ID
 * @param businessId - Business ID
 * @param reviewId - Review ID
 * @returns Review data or null if not found
 */
export async function getReview(
  userId: string,
  businessId: string,
  reviewId: string
): Promise<Review | null> {
  if (!db) {
    console.error("Firestore not initialized");
    return null;
  }

  try {
    const reviewRef = doc(
      db,
      "users",
      userId,
      "businesses",
      businessId,
      "reviews",
      reviewId
    );
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
 * @param userId - User ID
 * @param businessId - Business ID
 * @param data - Review data (without id, businessId removed from data as it's in path)
 * @returns Created review with ID
 */
export async function createReview(
  userId: string,
  businessId: string,
  data: Omit<
    ReviewCreateInput,
    "receivedAt" | "wasEdited" | "replyStatus" | "businessId"
  >
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

    // Validate before creating (add businessId for validation only)
    reviewCreateSchema.parse({ ...reviewData, businessId });

    const reviewsRef = collection(
      db,
      "users",
      userId,
      "businesses",
      businessId,
      "reviews"
    );
    const docRef = await addDoc(reviewsRef, reviewData);

    // Return the created review
    return (await getReview(userId, businessId, docRef.id)) as Review;
  } catch (error) {
    console.error("Error creating review:", error);
    throw new Error("לא ניתן ליצור ביקורת חדשה");
  }
}

/**
 * Update review reply (AI generated or edited)
 * @param userId - User ID
 * @param businessId - Business ID
 * @param reviewId - Review ID
 * @param reply - Reply text
 * @param isEdited - Whether this is a user edit
 * @returns Updated review
 */
export async function updateReviewReply(
  userId: string,
  businessId: string,
  reviewId: string,
  reply: string,
  isEdited: boolean = false
): Promise<Review> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const reviewRef = doc(
      db,
      "users",
      userId,
      "businesses",
      businessId,
      "reviews",
      reviewId
    );
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
    return (await getReview(userId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error updating review reply:", error);
    throw new Error("לא ניתן לעדכן את התגובה");
  }
}

/**
 * Approve a reply for posting
 * @param userId - User ID
 * @param businessId - Business ID
 * @param reviewId - Review ID
 * @returns Updated review
 */
export async function approveReply(
  userId: string,
  businessId: string,
  reviewId: string
): Promise<Review> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const reviewRef = doc(
      db,
      "users",
      userId,
      "businesses",
      businessId,
      "reviews",
      reviewId
    );
    await updateDoc(reviewRef, { replyStatus: "approved" });

    // Return the updated review
    return (await getReview(userId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error approving reply:", error);
    throw new Error("לא ניתן לאשר את התגובה");
  }
}

/**
 * Reject a reply
 * @param userId - User ID
 * @param businessId - Business ID
 * @param reviewId - Review ID
 * @returns Updated review
 */
export async function rejectReply(
  userId: string,
  businessId: string,
  reviewId: string
): Promise<Review> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const reviewRef = doc(
      db,
      "users",
      userId,
      "businesses",
      businessId,
      "reviews",
      reviewId
    );
    await updateDoc(reviewRef, { replyStatus: "rejected" });

    // Return the updated review
    return (await getReview(userId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error rejecting reply:", error);
    throw new Error("לא ניתן לדחות את התגובה");
  }
}

/**
 * Mark a review as posted with the reply that was posted
 * @param userId - User ID
 * @param businessId - Business ID
 * @param reviewId - Review ID
 * @param postedReply - The actual reply that was posted
 * @param postedBy - User ID who posted
 * @returns Updated review
 */
export async function markAsPosted(
  userId: string,
  businessId: string,
  reviewId: string,
  postedReply: string,
  postedBy: string
): Promise<Review> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const reviewRef = doc(
      db,
      "users",
      userId,
      "businesses",
      businessId,
      "reviews",
      reviewId
    );
    await updateDoc(reviewRef, {
      replyStatus: "posted",
      postedReply,
      postedAt: serverTimestamp(),
      postedBy,
    });

    // Return the updated review
    return (await getReview(userId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error marking as posted:", error);
    throw new Error("לא ניתן לסמן את התגובה כפורסמה");
  }
}

/**
 * Mark a review reply as failed
 * @param userId - User ID
 * @param businessId - Business ID
 * @param reviewId - Review ID
 * @returns Updated review
 */
export async function markAsFailed(
  userId: string,
  businessId: string,
  reviewId: string
): Promise<Review> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const reviewRef = doc(
      db,
      "users",
      userId,
      "businesses",
      businessId,
      "reviews",
      reviewId
    );
    await updateDoc(reviewRef, { replyStatus: "failed" });

    // Return the updated review
    return (await getReview(userId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error marking as failed:", error);
    throw new Error("לא ניתן לעדכן את סטטוס התגובה");
  }
}

/**
 * Update review data
 * @param userId - User ID
 * @param businessId - Business ID
 * @param reviewId - Review ID
 * @param data - Partial review data to update
 * @returns Updated review
 */
export async function updateReview(
  userId: string,
  businessId: string,
  reviewId: string,
  data: ReviewUpdateInput
): Promise<Review> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    // Validate update data
    const validatedData = reviewUpdateSchema.parse(data);

    const reviewRef = doc(
      db,
      "users",
      userId,
      "businesses",
      businessId,
      "reviews",
      reviewId
    );
    await updateDoc(reviewRef, validatedData);

    // Return the updated review
    return (await getReview(userId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error updating review:", error);
    throw new Error("לא ניתן לעדכן את הביקורת");
  }
}

/**
 * Get review statistics for a business
 * @param userId - User ID
 * @param businessId - Business ID
 * @returns Statistics object
 */
export async function getReviewStats(
  userId: string,
  businessId: string
): Promise<{
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
    const reviewsRef = collection(
      db,
      "users",
      userId,
      "businesses",
      businessId,
      "reviews"
    );
    const querySnapshot = await getDocs(reviewsRef);

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
 * @param userId - User ID
 * @param businessId - Business ID
 * @param limit - Number of reviews to fetch (default: 5)
 * @returns Array of recent reviews
 */
export async function getRecentReviews(
  userId: string,
  businessId: string,
  limit: number = 5
): Promise<Review[]> {
  const result = await getReviewsByBusiness(
    userId,
    businessId,
    undefined,
    limit
  );
  return result.reviews;
}

/**
 * Get pending reviews for a business (require approval)
 * @param userId - User ID
 * @param businessId - Business ID
 * @returns Array of pending reviews
 */
export async function getPendingReviews(
  userId: string,
  businessId: string
): Promise<Review[]> {
  const result = await getReviewsByBusiness(
    userId,
    businessId,
    { status: "pending" },
    100 // Get all pending
  );
  return result.reviews;
}

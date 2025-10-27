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
import { db } from "@/lib/firebase/config";
import { Review, ReplyStatus } from "@/types/database";
import {
  reviewSchema,
  reviewCreateSchema,
  reviewUpdateSchema,
  ReviewCreateInput,
  ReviewUpdateInput,
} from "@/lib/validation/database";

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
      "locations",
      businessId,
      "reviews"
    );
    const constraints: QueryConstraint[] = [];

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

    constraints.push(orderBy("receivedAt", "desc"));

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

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
      "locations",
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

    reviewCreateSchema.parse({ ...reviewData, businessId });

    const reviewsRef = collection(
      db,
      "users",
      userId,
      "locations",
      businessId,
      "reviews"
    );
    const docRef = await addDoc(reviewsRef, reviewData);

    return (await getReview(userId, businessId, docRef.id)) as Review;
  } catch (error) {
    console.error("Error creating review:", error);
    throw new Error("לא ניתן ליצור ביקורת חדשה");
  }
}

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
    const validatedData = reviewUpdateSchema.parse(data);

    const reviewRef = doc(
      db,
      "users",
      userId,
      "locations",
      businessId,
      "reviews",
      reviewId
    );
    await updateDoc(reviewRef, validatedData);

    return (await getReview(userId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error updating review:", error);
    throw new Error("לא ניתן לעדכן את הביקורת");
  }
}

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

export async function getPendingReviews(
  userId: string,
  businessId: string
): Promise<Review[]> {
  const result = await getReviewsByBusiness(
    userId,
    businessId,
    { status: "pending" },
    100
  );
  return result.reviews;
}

export async function countPendingReviews(
  userId: string,
  businessId: string
): Promise<number> {
  const pending = await getPendingReviews(userId, businessId);
  return pending.length;
}

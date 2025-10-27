import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Review } from "@/types/database";
import { getReview } from "@/lib/firebase/reviews";

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
      "locations",
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

    return (await getReview(userId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error updating review reply:", error);
    throw new Error("לא ניתן לעדכן את התגובה");
  }
}

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
      "locations",
      businessId,
      "reviews",
      reviewId
    );
    await updateDoc(reviewRef, { replyStatus: "approved" });

    return (await getReview(userId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error approving reply:", error);
    throw new Error("לא ניתן לאשר את התגובה");
  }
}

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
      "locations",
      businessId,
      "reviews",
      reviewId
    );
    await updateDoc(reviewRef, { replyStatus: "rejected" });

    return (await getReview(userId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error rejecting reply:", error);
    throw new Error("לא ניתן לדחות את התגובה");
  }
}

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
      "locations",
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

    return (await getReview(userId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error marking as posted:", error);
    throw new Error("לא ניתן לסמן את התגובה כפורסמה");
  }
}

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
      "locations",
      businessId,
      "reviews",
      reviewId
    );
    await updateDoc(reviewRef, { replyStatus: "failed" });

    return (await getReview(userId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error marking as failed:", error);
    throw new Error("לא ניתן לעדכן את סטטוס התגובה");
  }
}

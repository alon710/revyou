import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Review } from "@/types/database";
import { getReview } from "@/lib/firebase/reviews";

export async function updateReviewReply(
  userId: string,
  accountId: string,
  businessId: string,
  reviewId: string,
  reply: string
): Promise<Review> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const reviewRef = doc(
      db,
      "users",
      userId,
      "accounts",
      accountId,
      "businesses",
      businessId,
      "reviews",
      reviewId
    );
    const updateData: Record<string, unknown> = {
      aiReply: reply,
      aiReplyGeneratedAt: serverTimestamp(),
    };

    await updateDoc(reviewRef, updateData);

    return (await getReview(userId, accountId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error updating review reply:", error);
    throw new Error("לא ניתן לעדכן את התגובה");
  }
}

export async function rejectReply(
  userId: string,
  accountId: string,
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
      "accounts",
      accountId,
      "businesses",
      businessId,
      "reviews",
      reviewId
    );
    await updateDoc(reviewRef, { replyStatus: "rejected" });

    return (await getReview(userId, accountId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error rejecting reply:", error);
    throw new Error("לא ניתן לדחות את התגובה");
  }
}

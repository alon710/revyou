import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Review } from "@/types/database";
import { getReview } from "@/lib/firebase/reviews";

export async function updateReviewReply(
  userId: string,
  locationId: string,
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
      "locations",
      locationId,
      "reviews",
      reviewId
    );
    const updateData: Record<string, unknown> = {
      aiReply: reply,
      aiReplyGeneratedAt: serverTimestamp(),
    };

    await updateDoc(reviewRef, updateData);

    return (await getReview(userId, locationId, reviewId)) as Review;
  } catch (error) {
    console.error("Error updating review reply:", error);
    throw new Error("לא ניתן לעדכן את התגובה");
  }
}

export async function rejectReply(
  userId: string,
  locationId: string,
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
      locationId,
      "reviews",
      reviewId
    );
    await updateDoc(reviewRef, { replyStatus: "rejected" });

    return (await getReview(userId, locationId, reviewId)) as Review;
  } catch (error) {
    console.error("Error rejecting reply:", error);
    throw new Error("לא ניתן לדחות את התגובה");
  }
}

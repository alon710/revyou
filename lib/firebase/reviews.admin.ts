import { adminDb } from "@/lib/firebase/admin";
import { Review } from "@/types/database";
import { reviewSchemaAdmin } from "@/lib/validation/database.admin";

/**
 * ADMIN SDK FUNCTIONS FOR REVIEWS
 * These functions use Firebase Admin SDK and should ONLY be called from server-side code (API routes, server actions)
 * They bypass Firestore security rules and have elevated privileges
 */

/**
 * Get a single review by ID (Admin SDK version)
 * @param userId - User ID
 * @param businessId - Business ID
 * @param reviewId - Review ID
 * @returns Review data or null if not found
 */
export async function getReviewAdmin(
  userId: string,
  businessId: string,
  reviewId: string
): Promise<Review | null> {
  try {
    const reviewRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("businesses")
      .doc(businessId)
      .collection("reviews")
      .doc(reviewId);
    const reviewSnap = await reviewRef.get();

    if (reviewSnap.exists) {
      const data = reviewSnap.data();
      const validated = reviewSchemaAdmin.parse({ id: reviewSnap.id, ...data });
      return validated as Review;
    }

    return null;
  } catch (error) {
    console.error("Error fetching review (admin):", error);
    throw new Error("לא ניתן לטעון את הביקורת");
  }
}

/**
 * Update review reply (Admin SDK version)
 * @param userId - User ID
 * @param businessId - Business ID
 * @param reviewId - Review ID
 * @param reply - Reply text
 * @param isEdited - Whether this is a user edit
 * @returns Updated review
 */
export async function updateReviewReplyAdmin(
  userId: string,
  businessId: string,
  reviewId: string,
  reply: string,
  isEdited: boolean = false
): Promise<Review> {
  try {
    const reviewRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("businesses")
      .doc(businessId)
      .collection("reviews")
      .doc(reviewId);
    const updateData: Record<string, unknown> = {
      aiReply: reply,
      aiReplyGeneratedAt: new Date(),
    };

    if (isEdited) {
      updateData.wasEdited = true;
      updateData.editedReply = reply;
    }

    await reviewRef.update(updateData);

    // Return the updated review
    return (await getReviewAdmin(userId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error updating review reply (admin):", error);
    throw new Error("לא ניתן לעדכן את התגובה");
  }
}

/**
 * Mark a review as posted with the reply that was posted (Admin SDK version)
 * @param userId - User ID
 * @param businessId - Business ID
 * @param reviewId - Review ID
 * @param postedReply - The actual reply that was posted
 * @param postedBy - User ID who posted
 * @returns Updated review
 */
export async function markAsPostedAdmin(
  userId: string,
  businessId: string,
  reviewId: string,
  postedReply: string,
  postedBy: string
): Promise<Review> {
  try {
    const reviewRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("businesses")
      .doc(businessId)
      .collection("reviews")
      .doc(reviewId);
    await reviewRef.update({
      replyStatus: "posted",
      postedReply,
      postedAt: new Date(),
      postedBy,
    });

    // Return the updated review
    return (await getReviewAdmin(userId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error marking as posted (admin):", error);
    throw new Error("לא ניתן לסמן את התגובה כפורסמה");
  }
}

/**
 * Mark a review reply as failed (Admin SDK version)
 * @param userId - User ID
 * @param businessId - Business ID
 * @param reviewId - Review ID
 * @returns Updated review
 */
export async function markAsFailedAdmin(
  userId: string,
  businessId: string,
  reviewId: string
): Promise<Review> {
  try {
    const reviewRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("businesses")
      .doc(businessId)
      .collection("reviews")
      .doc(reviewId);
    await reviewRef.update({ replyStatus: "failed" });

    // Return the updated review
    return (await getReviewAdmin(userId, businessId, reviewId)) as Review;
  } catch (error) {
    console.error("Error marking as failed (admin):", error);
    throw new Error("לא ניתן לעדכן את סטטוס התגובה");
  }
}

import { adminDb } from "@/lib/firebase/admin";
import { Review } from "@/types/database";
import { reviewSchemaAdmin } from "@/lib/validation/database.admin";

export async function getReviewAdmin(
  userId: string,
  locationId: string,
  reviewId: string
): Promise<Review | null> {
  try {
    const reviewRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("locations")
      .doc(locationId)
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
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      if (error.name === "ZodError") {
        console.error("Validation error:", JSON.stringify(error, null, 2));
      }
    }
    throw new Error("לא ניתן לטעון את הביקורת");
  }
}

export async function updateReviewReplyAdmin(
  userId: string,
  locationId: string,
  reviewId: string,
  reply: string,
  isEdited: boolean = false
): Promise<Review> {
  try {
    const reviewRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("locations")
      .doc(locationId)
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

    return (await getReviewAdmin(userId, locationId, reviewId)) as Review;
  } catch (error) {
    console.error("Error updating review reply (admin):", error);
    throw new Error("לא ניתן לעדכן את התגובה");
  }
}

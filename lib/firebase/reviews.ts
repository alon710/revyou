import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Review } from "@/types/database";
import { reviewSchema } from "@/lib/validation/database";

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

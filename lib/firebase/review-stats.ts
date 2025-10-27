import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

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
      "locations",
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
      averageRating: Math.round(averageRating * 10) / 10,
    };
  } catch (error) {
    console.error("Error fetching review stats:", error);
    throw new Error("לא ניתן לטעון את סטטיסטיקת הביקורות");
  }
}

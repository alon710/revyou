import { adminDb } from "@/lib/firebase/admin";
import type {
  ReviewCreate,
  Review,
  ReviewUpdate,
  ReviewFilters,
} from "@/lib/types";
import { firestorePaths } from "@/lib/utils/firestore-paths";
import { AdminQueryBuilder } from "@/lib/utils/query-builder";
import { BaseRepository } from "./base.repository";

export class ReviewsRepositoryAdmin extends BaseRepository<
  ReviewCreate,
  Review,
  ReviewUpdate
> {
  private userId: string;
  private accountId: string;
  private businessId: string;

  constructor(userId: string, accountId: string, businessId: string) {
    super(firestorePaths.reviews(userId, accountId, businessId));
    this.userId = userId;
    this.accountId = accountId;
    this.businessId = businessId;
  }

  async get(reviewId: string): Promise<Review | null> {
    const reviewRef = adminDb.doc(`${this.basePath}/${reviewId}`);
    const snapshot = await reviewRef.get();

    if (!snapshot.exists) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Review;
  }

  async list(filters: ReviewFilters = {}): Promise<Review[]> {
    const collectionRef = adminDb.collection(this.basePath);
    const q = AdminQueryBuilder.buildReviewQuery(collectionRef, filters);
    const snapshot = await q.get();

    let reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];

    if (filters.ids) {
      const idSet = new Set(filters.ids);
      reviews = reviews.filter((r) => idSet.has(r.id));
    }

    if (filters.offset) {
      reviews = reviews.slice(filters.offset);
    }

    return reviews;
  }

  async create(data: ReviewCreate): Promise<Review> {
    const collectionRef = adminDb.collection(this.basePath);

    const reviewData = {
      ...data,
      receivedAt: new Date(),
      replyStatus: data.replyStatus || "pending",
    };

    const docRef = await collectionRef.add(reviewData);
    const created = await this.get(docRef.id);

    if (!created) throw new Error("Failed to create review");

    return created;
  }

  async update(reviewId: string, data: ReviewUpdate): Promise<Review> {
    const reviewRef = adminDb.doc(`${this.basePath}/${reviewId}`);
    await reviewRef.update(data as { [key: string]: any });

    const updated = await this.get(reviewId);
    if (!updated) throw new Error("Review not found after update");

    return updated;
  }

  async delete(reviewId: string): Promise<void> {
    const reviewRef = adminDb.doc(`${this.basePath}/${reviewId}`);
    await reviewRef.delete();
  }

  async updateAiReply(reviewId: string, aiReply: string): Promise<Review> {
    return this.update(reviewId, {
      aiReply,
      aiReplyGeneratedAt: new Date() as any,
    });
  }

  async markAsPosted(
    reviewId: string,
    postedReply: string,
    postedBy: string
  ): Promise<Review> {
    return this.update(reviewId, {
      replyStatus: "posted",
      postedReply,
      postedAt: new Date() as any,
      postedBy,
    });
  }

  async markAsRejected(reviewId: string): Promise<Review> {
    return this.update(reviewId, {
      replyStatus: "rejected",
    });
  }

  async findByGoogleReviewId(googleReviewId: string): Promise<Review | null> {
    const collectionRef = adminDb.collection(this.basePath);
    const snapshot = await collectionRef
      .where("googleReviewId", "==", googleReviewId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as Review;
  }
}

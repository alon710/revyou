import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type {
  ReviewCreate,
  Review,
  ReviewUpdate,
  ReviewFilters,
} from "@/lib/types";
import { firestorePaths } from "@/lib/utils/firestore-paths";
import { QueryBuilder } from "@/lib/utils/query-builder";
import { BaseRepository } from "./base.repository";

/**
 * Reviews Repository (Client SDK)
 * Handles all review CRUD operations using Firebase client SDK
 */
export class ReviewsRepository extends BaseRepository<
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

  /**
   * Get a single review by ID
   */
  async get(reviewId: string): Promise<Review | null> {
    if (!db) throw new Error("Firestore not initialized");

    const reviewRef = doc(db, this.basePath, reviewId);
    const snapshot = await getDoc(reviewRef);

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Review;
  }

  /**
   * List reviews with optional filtering
   * Supports filtering by status, rating, date range, and sorting
   */
  async list(filters: ReviewFilters = {}): Promise<Review[]> {
    if (!db) throw new Error("Firestore not initialized");

    const collectionRef = collection(db, this.basePath);
    const q = QueryBuilder.buildReviewQuery(collectionRef, filters);
    const snapshot = await getDocs(q);

    let reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];

    // Apply client-side filters
    if (filters.ids) {
      reviews = QueryBuilder.filterByIds(reviews, filters.ids);
    }

    if (filters.offset) {
      reviews = QueryBuilder.applyOffset(reviews, filters.offset);
    }

    return reviews;
  }

  /**
   * Create a new review
   */
  async create(data: ReviewCreate): Promise<Review> {
    if (!db) throw new Error("Firestore not initialized");

    const collectionRef = collection(db, this.basePath);

    // Add system fields
    const reviewData = {
      ...data,
      receivedAt: Timestamp.now(),
      replyStatus: data.replyStatus || "pending",
    };

    const docRef = await addDoc(collectionRef, reviewData);
    const created = await this.get(docRef.id);

    if (!created) throw new Error("Failed to create review");

    return created;
  }

  /**
   * Update an existing review
   */
  async update(reviewId: string, data: ReviewUpdate): Promise<Review> {
    if (!db) throw new Error("Firestore not initialized");

    const reviewRef = doc(db, this.basePath, reviewId);
    await updateDoc(reviewRef, { ...data });

    const updated = await this.get(reviewId);
    if (!updated) throw new Error("Review not found after update");

    return updated;
  }

  /**
   * Delete a review
   */
  async delete(reviewId: string): Promise<void> {
    if (!db) throw new Error("Firestore not initialized");

    const reviewRef = doc(db, this.basePath, reviewId);
    await deleteDoc(reviewRef);
  }

  /**
   * Update AI reply for a review
   */
  async updateAiReply(reviewId: string, aiReply: string): Promise<Review> {
    return this.update(reviewId, {
      aiReply,
      aiReplyGeneratedAt: Timestamp.now(),
    });
  }

  /**
   * Mark review reply as posted
   */
  async markAsPosted(
    reviewId: string,
    postedReply: string,
    postedBy: string
  ): Promise<Review> {
    return this.update(reviewId, {
      replyStatus: "posted",
      postedReply,
      postedAt: Timestamp.now(),
      postedBy,
    });
  }

  /**
   * Mark review reply as rejected
   */
  async markAsRejected(reviewId: string): Promise<Review> {
    return this.update(reviewId, {
      replyStatus: "rejected",
    });
  }
}

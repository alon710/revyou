import { adminDb } from "@/lib/firebase/admin";
import type {
  BusinessCreate,
  Business,
  BusinessUpdate,
  BusinessFilters,
} from "@/lib/types";
import { firestorePaths } from "@/lib/utils/firestore-paths";
import { AdminQueryBuilder } from "@/lib/utils/query-builder";
import { BaseRepository } from "./base.repository";

/**
 * Businesses Repository (Admin SDK)
 * Handles all business CRUD operations using Firebase Admin SDK
 * Used in API routes and Cloud Functions
 */
export class BusinessesRepositoryAdmin extends BaseRepository<
  BusinessCreate,
  Business,
  BusinessUpdate
> {
  private userId: string;
  private accountId: string;

  constructor(userId: string, accountId: string) {
    super(firestorePaths.businesses(userId, accountId));
    this.userId = userId;
    this.accountId = accountId;
  }

  /**
   * Get a single business by ID
   */
  async get(businessId: string): Promise<Business | null> {
    const businessRef = adminDb.doc(`${this.basePath}/${businessId}`);
    const snapshot = await businessRef.get();

    if (!snapshot.exists) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Business;
  }

  /**
   * List businesses with optional filtering
   */
  async list(filters: BusinessFilters = {}): Promise<Business[]> {
    const collectionRef = adminDb.collection(this.basePath);
    const q = AdminQueryBuilder.buildBusinessQuery(collectionRef, filters);
    const snapshot = await q.get();

    let businesses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Business[];

    // Apply client-side filters
    if (filters.ids) {
      const idSet = new Set(filters.ids);
      businesses = businesses.filter((b) => idSet.has(b.id));
    }

    if (filters.offset) {
      businesses = businesses.slice(filters.offset);
    }

    return businesses;
  }

  /**
   * Create a new business
   */
  async create(data: BusinessCreate): Promise<Business> {
    const collectionRef = adminDb.collection(this.basePath);

    // Add system fields
    const businessData = {
      ...data,
      connected: true,
      connectedAt: new Date(),
    };

    const docRef = await collectionRef.add(businessData);
    const created = await this.get(docRef.id);

    if (!created) throw new Error("Failed to create business");

    return created;
  }

  /**
   * Update an existing business
   */
  async update(businessId: string, data: BusinessUpdate): Promise<Business> {
    const businessRef = adminDb.doc(`${this.basePath}/${businessId}`);
    await businessRef.update(data);

    const updated = await this.get(businessId);
    if (!updated) throw new Error("Business not found after update");

    return updated;
  }

  /**
   * Delete a business
   */
  async delete(businessId: string): Promise<void> {
    const businessRef = adminDb.doc(`${this.basePath}/${businessId}`);
    await businessRef.delete();
  }

  /**
   * Check if a business with given googleBusinessId already exists
   */
  async existsByGoogleId(googleBusinessId: string): Promise<boolean> {
    const businesses = await this.list({});
    return businesses.some((b) => b.googleBusinessId === googleBusinessId);
  }

  /**
   * Find business by Google Business ID
   */
  async findByGoogleBusinessId(
    googleBusinessId: string
  ): Promise<Business | null> {
    const collectionRef = adminDb.collection(this.basePath);
    const snapshot = await collectionRef
      .where("googleBusinessId", "==", googleBusinessId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as Business;
  }

  /**
   * Disconnect a business (mark as not connected)
   */
  async disconnect(businessId: string): Promise<Business> {
    return this.update(businessId, {
      connected: false,
    });
  }
}

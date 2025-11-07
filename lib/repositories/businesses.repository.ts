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
  BusinessCreate,
  Business,
  BusinessUpdate,
  BusinessFilters,
} from "@/lib/types";
import { firestorePaths } from "@/lib/utils/firestore-paths";
import { QueryBuilder } from "@/lib/utils/query-builder";
import { BaseRepository } from "./base.repository";

/**
 * Businesses Repository (Client SDK)
 * Handles all business CRUD operations using Firebase client SDK
 */
export class BusinessesRepository extends BaseRepository<
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
    if (!db) throw new Error("Firestore not initialized");

    const businessRef = doc(db, this.basePath, businessId);
    const snapshot = await getDoc(businessRef);

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Business;
  }

  /**
   * List businesses with optional filtering
   * Supports filtering by connection status and sorting
   */
  async list(filters: BusinessFilters = {}): Promise<Business[]> {
    if (!db) throw new Error("Firestore not initialized");

    const collectionRef = collection(db, this.basePath);
    const q = QueryBuilder.buildBusinessQuery(collectionRef, filters);
    const snapshot = await getDocs(q);

    let businesses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Business[];

    // Apply client-side filters
    if (filters.ids) {
      businesses = QueryBuilder.filterByIds(businesses, filters.ids);
    }

    if (filters.offset) {
      businesses = QueryBuilder.applyOffset(businesses, filters.offset);
    }

    return businesses;
  }

  /**
   * Create a new business
   */
  async create(data: BusinessCreate): Promise<Business> {
    if (!db) throw new Error("Firestore not initialized");

    const collectionRef = collection(db, this.basePath);

    // Add system fields
    const businessData = {
      ...data,
      connected: true,
      connectedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collectionRef, businessData);
    const created = await this.get(docRef.id);

    if (!created) throw new Error("Failed to create business");

    return created;
  }

  /**
   * Update an existing business
   */
  async update(businessId: string, data: BusinessUpdate): Promise<Business> {
    if (!db) throw new Error("Firestore not initialized");

    const businessRef = doc(db, this.basePath, businessId);
    await updateDoc(businessRef, { ...data });

    const updated = await this.get(businessId);
    if (!updated) throw new Error("Business not found after update");

    return updated;
  }

  /**
   * Delete a business
   */
  async delete(businessId: string): Promise<void> {
    if (!db) throw new Error("Firestore not initialized");

    const businessRef = doc(db, this.basePath, businessId);
    await deleteDoc(businessRef);
  }

  /**
   * Check if a business with given googleBusinessId already exists
   */
  async existsByGoogleId(googleBusinessId: string): Promise<boolean> {
    if (!db) throw new Error("Firestore not initialized");

    const businesses = await this.list({});
    return businesses.some((b) => b.googleBusinessId === googleBusinessId);
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

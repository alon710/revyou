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
  AccountCreate,
  Account,
  AccountUpdate,
  AccountFilters,
} from "@/lib/types";
import { firestorePaths } from "@/lib/utils/firestore-paths";
import { QueryBuilder } from "@/lib/utils/query-builder";
import { BaseRepository } from "./base.repository";

/**
 * Accounts Repository (Client SDK)
 * Handles all account CRUD operations using Firebase client SDK
 */
export class AccountsRepository extends BaseRepository<
  AccountCreate,
  Account,
  AccountUpdate
> {
  private userId: string;

  constructor(userId: string) {
    super(firestorePaths.accounts(userId));
    this.userId = userId;
  }

  /**
   * Get a single account by ID
   */
  async get(accountId: string): Promise<Account | null> {
    if (!db) throw new Error("Firestore not initialized");

    const accountRef = doc(db, this.basePath, accountId);
    const snapshot = await getDoc(accountRef);

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Account;
  }

  /**
   * List accounts with optional filtering
   */
  async list(filters: AccountFilters = {}): Promise<Account[]> {
    if (!db) throw new Error("Firestore not initialized");

    const collectionRef = collection(db, this.basePath);
    const q = QueryBuilder.buildAccountQuery(collectionRef, filters);
    const snapshot = await getDocs(q);

    let accounts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Account[];

    // Apply client-side filters
    if (filters.ids) {
      accounts = QueryBuilder.filterByIds(accounts, filters.ids);
    }

    if (filters.offset) {
      accounts = QueryBuilder.applyOffset(accounts, filters.offset);
    }

    return accounts;
  }

  /**
   * Create a new account
   */
  async create(data: AccountCreate): Promise<Account> {
    if (!db) throw new Error("Firestore not initialized");

    const collectionRef = collection(db, this.basePath);

    // Add system fields
    const accountData = {
      ...data,
      connectedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collectionRef, accountData);
    const created = await this.get(docRef.id);

    if (!created) throw new Error("Failed to create account");

    return created;
  }

  /**
   * Update an existing account
   */
  async update(accountId: string, data: AccountUpdate): Promise<Account> {
    if (!db) throw new Error("Firestore not initialized");

    const accountRef = doc(db, this.basePath, accountId);
    await updateDoc(accountRef, { ...data });

    const updated = await this.get(accountId);
    if (!updated) throw new Error("Account not found after update");

    return updated;
  }

  /**
   * Delete an account
   */
  async delete(accountId: string): Promise<void> {
    if (!db) throw new Error("Firestore not initialized");

    const accountRef = doc(db, this.basePath, accountId);
    await deleteDoc(accountRef);
  }

  /**
   * Find account by email address
   */
  async findByEmail(email: string): Promise<Account | null> {
    const accounts = await this.list({ email });
    return accounts.length > 0 ? accounts[0] : null;
  }

  /**
   * Update last synced timestamp
   */
  async updateLastSynced(accountId: string): Promise<Account> {
    return this.update(accountId, {
      lastSynced: Timestamp.now(),
    });
  }
}

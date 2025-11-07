import { adminDb } from "@/lib/firebase/admin";
import type {
  AccountCreate,
  Account,
  AccountUpdate,
  AccountFilters,
} from "@/lib/types";
import { firestorePaths } from "@/lib/utils/firestore-paths";
import { AdminQueryBuilder } from "@/lib/utils/query-builder";
import { BaseRepository } from "./base.repository";

/**
 * Accounts Repository (Admin SDK)
 * Handles all account CRUD operations using Firebase Admin SDK
 * Used in API routes and Cloud Functions
 */
export class AccountsRepositoryAdmin extends BaseRepository<
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
    const accountRef = adminDb.doc(`${this.basePath}/${accountId}`);
    const snapshot = await accountRef.get();

    if (!snapshot.exists) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Account;
  }

  /**
   * List accounts with optional filtering
   */
  async list(filters: AccountFilters = {}): Promise<Account[]> {
    const collectionRef = adminDb.collection(this.basePath);
    const q = AdminQueryBuilder.buildAccountQuery(collectionRef, filters);
    const snapshot = await q.get();

    let accounts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Account[];

    // Apply client-side filters
    if (filters.ids) {
      const idSet = new Set(filters.ids);
      accounts = accounts.filter((a) => idSet.has(a.id));
    }

    if (filters.offset) {
      accounts = accounts.slice(filters.offset);
    }

    return accounts;
  }

  /**
   * Create a new account
   */
  async create(data: AccountCreate): Promise<Account> {
    const collectionRef = adminDb.collection(this.basePath);

    // Add system fields
    const accountData = {
      ...data,
      connectedAt: new Date(),
    };

    const docRef = await collectionRef.add(accountData);
    const created = await this.get(docRef.id);

    if (!created) throw new Error("Failed to create account");

    return created;
  }

  /**
   * Update an existing account
   */
  async update(accountId: string, data: AccountUpdate): Promise<Account> {
    const accountRef = adminDb.doc(`${this.basePath}/${accountId}`);
    await accountRef.update(data as { [key: string]: any });

    const updated = await this.get(accountId);
    if (!updated) throw new Error("Account not found after update");

    return updated;
  }

  /**
   * Delete an account
   */
  async delete(accountId: string): Promise<void> {
    const accountRef = adminDb.doc(`${this.basePath}/${accountId}`);
    await accountRef.delete();
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
      lastSynced: new Date() as any,
    });
  }
}

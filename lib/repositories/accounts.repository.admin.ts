import { adminDb } from "@/lib/firebase/admin";
import type { AccountCreate, Account, AccountUpdate, AccountUpdateInput, AccountFilters } from "@/lib/types";
import * as admin from "firebase-admin";
import { firestorePaths } from "@/lib/utils/firestore-paths";
import { AdminQueryBuilder } from "@/lib/utils/query-builder";
import { BaseRepository } from "./base.repository";
import { serializeDocument, serializeDocuments } from "@/lib/utils/firestore-serializer";

export class AccountsRepositoryAdmin extends BaseRepository<AccountCreate, Account, AccountUpdate> {
  private userId: string;

  constructor(userId: string) {
    super(firestorePaths.accounts(userId));
    this.userId = userId;
  }

  async get(accountId: string): Promise<Account | null> {
    const accountRef = adminDb.doc(`${this.basePath}/${accountId}`);
    const snapshot = await accountRef.get();

    if (!snapshot.exists) return null;

    const account = {
      id: snapshot.id,
      ...snapshot.data(),
    } as Account;

    return serializeDocument(account);
  }

  async list(filters: AccountFilters = {}): Promise<Account[]> {
    const collectionRef = adminDb.collection(this.basePath);
    const q = AdminQueryBuilder.buildAccountQuery(collectionRef, filters);
    const snapshot = await q.get();

    let accounts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Account[];

    if (filters.ids) {
      const idSet = new Set(filters.ids);
      accounts = accounts.filter((a) => idSet.has(a.id));
    }

    return serializeDocuments(accounts);
  }

  async create(data: AccountCreate): Promise<Account> {
    const collectionRef = adminDb.collection(this.basePath);

    const accountData = {
      ...data,
      connectedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await collectionRef.add(accountData);
    const created = await this.get(docRef.id);

    if (!created) throw new Error("Failed to create account");

    return created;
  }

  async update(accountId: string, data: AccountUpdateInput): Promise<Account> {
    const accountRef = adminDb.doc(`${this.basePath}/${accountId}`);
    await accountRef.update(data);

    const updated = await this.get(accountId);
    if (!updated) throw new Error("Account not found after update");

    return updated;
  }

  async delete(accountId: string): Promise<void> {
    const accountRef = adminDb.doc(`${this.basePath}/${accountId}`);
    await accountRef.delete();
  }

  async findByEmail(email: string): Promise<Account | null> {
    const accounts = await this.list({ email });
    return accounts.length > 0 ? accounts[0] : null;
  }

  async updateLastSynced(accountId: string): Promise<Account> {
    return this.update(accountId, {
      lastSynced: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

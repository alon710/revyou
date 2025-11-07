import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { UserCreate, User, UserUpdate } from "@/lib/types";
import { BaseRepository } from "./base.repository";

/**
 * Users Repository (Client SDK)
 * Handles all user CRUD operations using Firebase client SDK
 * Note: User documents are created by Firebase Auth, not manually
 */
export class UsersRepository extends BaseRepository<
  UserCreate,
  User,
  UserUpdate
> {
  constructor() {
    super("users");
  }

  /**
   * Get a single user by UID
   */
  async get(userId: string): Promise<User | null> {
    if (!db) throw new Error("Firestore not initialized");

    const userRef = doc(db, this.basePath, userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) return null;

    return {
      uid: snapshot.id,
      ...snapshot.data(),
    } as User;
  }

  /**
   * List operation not typically used for users
   * Users are accessed individually by UID
   */
  async list(): Promise<User[]> {
    throw new Error("List operation not supported for users");
  }

  /**
   * Create operation not typically used
   * Users are created through Firebase Auth
   */
  async create(_data: UserCreate): Promise<User> {
    throw new Error(
      "User creation should be handled by Firebase Auth, not directly"
    );
  }

  /**
   * Update an existing user
   */
  async update(userId: string, data: UserUpdate): Promise<User> {
    if (!db) throw new Error("Firestore not initialized");

    const userRef = doc(db, this.basePath, userId);

    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(userRef, updateData);

    const updated = await this.get(userId);
    if (!updated) throw new Error("User not found after update");

    return updated;
  }

  /**
   * Delete operation not typically used for users
   * User deletion should be handled through Firebase Auth
   */
  async delete(_userId: string): Promise<void> {
    throw new Error(
      "User deletion should be handled by Firebase Auth, not directly"
    );
  }

  /**
   * Update selected account
   */
  async updateSelectedAccount(
    userId: string,
    accountId: string
  ): Promise<User> {
    return this.update(userId, {
      selectedAccountId: accountId,
    });
  }

  /**
   * Update selected business
   */
  async updateSelectedBusiness(
    userId: string,
    businessId: string
  ): Promise<User> {
    return this.update(userId, {
      selectedBusinessId: businessId,
    });
  }
}

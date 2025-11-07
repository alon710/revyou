import { adminDb } from "@/lib/firebase/admin";
import type { UserCreate, User, UserUpdate } from "@/lib/types";
import { BaseRepository } from "./base.repository";

/**
 * Users Repository (Admin SDK)
 * Handles all user CRUD operations using Firebase Admin SDK
 * Used in API routes and Cloud Functions
 */
export class UsersRepositoryAdmin extends BaseRepository<
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
    const userRef = adminDb.doc(`${this.basePath}/${userId}`);
    const snapshot = await userRef.get();

    if (!snapshot.exists) return null;

    return {
      uid: snapshot.id,
      ...snapshot.data(),
    } as User;
  }

  /**
   * List operation not typically used for users
   */
  async list(): Promise<User[]> {
    throw new Error("List operation not supported for users");
  }

  /**
   * Create operation not typically used
   * Users are created through Firebase Auth
   */
  async create(data: UserCreate): Promise<User> {
    throw new Error(
      "User creation should be handled by Firebase Auth, not directly"
    );
  }

  /**
   * Update an existing user
   */
  async update(userId: string, data: UserUpdate): Promise<User> {
    const userRef = adminDb.doc(`${this.basePath}/${userId}`);

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await userRef.update(updateData);

    const updated = await this.get(userId);
    if (!updated) throw new Error("User not found after update");

    return updated;
  }

  /**
   * Delete operation not typically used for users
   */
  async delete(userId: string): Promise<void> {
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

import { adminDb } from "@/lib/firebase/admin";
import type { UserCreate, User, UserUpdate } from "@/lib/types";
import { BaseRepository } from "./base.repository";

export class UsersRepositoryAdmin extends BaseRepository<
  UserCreate,
  User,
  UserUpdate
> {
  constructor() {
    super("users");
  }

  async get(userId: string): Promise<User | null> {
    const userRef = adminDb.doc(`${this.basePath}/${userId}`);
    const snapshot = await userRef.get();

    if (!snapshot.exists) return null;

    return {
      uid: snapshot.id,
      ...snapshot.data(),
    } as User;
  }

  async list(): Promise<User[]> {
    throw new Error("List operation not supported for users");
  }

  async create(_data: UserCreate): Promise<User> {
    throw new Error(
      "User creation should be handled by Firebase Auth, not directly"
    );
  }

  async update(userId: string, data: UserUpdate): Promise<User> {
    const userRef = adminDb.doc(`${this.basePath}/${userId}`);

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await userRef.update(updateData as { [key: string]: any });

    const updated = await this.get(userId);
    if (!updated) throw new Error("User not found after update");

    return updated;
  }

  async delete(_userId: string): Promise<void> {
    throw new Error(
      "User deletion should be handled by Firebase Auth, not directly"
    );
  }

  async updateSelectedAccount(
    userId: string,
    accountId: string
  ): Promise<User> {
    return this.update(userId, {
      selectedAccountId: accountId,
    });
  }

  async updateSelectedBusiness(
    userId: string,
    businessId: string
  ): Promise<User> {
    return this.update(userId, {
      selectedBusinessId: businessId,
    });
  }
}

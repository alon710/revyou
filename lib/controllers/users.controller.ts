import type { UserCreate, User, UserUpdate } from "@/lib/types";
import { UsersRepositoryAdmin } from "@/lib/repositories/users.repository.admin";
import { BaseController } from "./base.controller";

/**
 * Users Controller
 * Handles business logic for user operations
 */
export class UsersController extends BaseController<
  UserCreate,
  User,
  UserUpdate
> {
  constructor() {
    const repository = new UsersRepositoryAdmin();
    super(repository);
  }

  /**
   * Get a user by UID
   */
  async getUser(userId: string): Promise<User> {
    return this.ensureExists(userId, "User");
  }

  /**
   * Update a user
   */
  async updateUser(userId: string, data: UserUpdate): Promise<User> {
    return this.handleError(async () => {
      await this.ensureExists(userId, "User");
      return this.repository.update(userId, data);
    }, "Failed to update user");
  }

  /**
   * Update selected account for a user
   */
  async updateSelectedAccount(
    userId: string,
    accountId: string
  ): Promise<User> {
    const repo = this.repository as UsersRepositoryAdmin;
    return this.handleError(
      () => repo.updateSelectedAccount(userId, accountId),
      "Failed to update selected account"
    );
  }

  /**
   * Update selected business for a user
   */
  async updateSelectedBusiness(
    userId: string,
    businessId: string
  ): Promise<User> {
    const repo = this.repository as UsersRepositoryAdmin;
    return this.handleError(
      () => repo.updateSelectedBusiness(userId, businessId),
      "Failed to update selected business"
    );
  }
}

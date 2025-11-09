import type { UserCreate, User, UserUpdate } from "@/lib/types";
import { UsersRepositoryAdmin } from "@/lib/repositories/users.repository.admin";
import { BaseController } from "./base.controller";

export class UsersController extends BaseController<UserCreate, User, UserUpdate> {
  constructor() {
    const repository = new UsersRepositoryAdmin();
    super(repository);
  }

  async getUser(userId: string): Promise<User> {
    return this.ensureExists(userId, "User");
  }

  async updateUser(userId: string, data: UserUpdate): Promise<User> {
    return this.handleError(async () => {
      await this.ensureExists(userId, "User");
      return this.repository.update(userId, data);
    }, "Failed to update user");
  }
}

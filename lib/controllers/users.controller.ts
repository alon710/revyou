import { UsersConfigsRepository } from "@/lib/db/repositories";
import type { UsersConfig, UsersConfigInsert } from "@/lib/db/schema";

export class UsersController {
  async getUserConfig(userId: string): Promise<UsersConfig> {
    const repo = new UsersConfigsRepository();
    return repo.getOrCreate(userId);
  }

  async updateUserConfig(userId: string, data: Partial<UsersConfigInsert>): Promise<UsersConfig> {
    const repo = new UsersConfigsRepository();
    return repo.update(userId, data);
  }
}

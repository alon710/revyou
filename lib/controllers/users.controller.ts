import { UsersConfigsRepository } from "@/lib/db/repositories";
import type { UsersConfig } from "@/lib/db/schema";
import type { UserConfigUpdate } from "@/lib/types/user.types";

export class UsersController {
  async getUserConfig(userId: string): Promise<UsersConfig> {
    const repo = new UsersConfigsRepository();
    return repo.getOrCreate(userId);
  }

  async updateUserConfig(userId: string, data: UserConfigUpdate): Promise<UsersConfig> {
    const repo = new UsersConfigsRepository();
    return repo.updateConfigs(userId, data);
  }
}

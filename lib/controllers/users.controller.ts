import { UsersConfigsRepository } from "@/lib/db/repositories";
import type { UsersConfig } from "@/lib/db/schema";
import type { UserConfigUpdate } from "@/lib/types/user.types";
import type { Locale } from "@/lib/locale";

export class UsersController {
  async getUserConfig(userId: string, detectedLocale?: Locale): Promise<UsersConfig> {
    const repo = new UsersConfigsRepository();
    return repo.getOrCreate(userId, detectedLocale);
  }

  async updateUserConfig(userId: string, data: UserConfigUpdate): Promise<UsersConfig> {
    const repo = new UsersConfigsRepository();
    return repo.updateConfigs(userId, data);
  }
}

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  usersConfigs,
  type UsersConfig,
  type UsersConfigInsert,
  type UserConfigKey,
  type UserConfigMap,
  type UserConfigValue,
} from "@/lib/db/schema";

export class UsersConfigsRepository {
  async get(userId: string): Promise<UsersConfig | null> {
    const [config] = await db.select().from(usersConfigs).where(eq(usersConfigs.userId, userId)).limit(1);

    return config || null;
  }

  async getOrCreate(userId: string): Promise<UsersConfig> {
    try {
      const [config] = await db
        .insert(usersConfigs)
        .values({
          userId,
          configs: {
            EMAIL_ON_NEW_REVIEW: true,
            LOCALE: "en",
          },
        })
        .onConflictDoUpdate({
          target: usersConfigs.userId,
          set: { updatedAt: sql`now()` },
        })
        .returning();

      if (!config) {
        throw new Error("Failed to get or create user configuration");
      }

      return config;
    } catch (error) {
      console.error("Error in getOrCreate:", error);
      throw new Error(
        `Failed to get or create user configuration: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async create(data: UsersConfigInsert): Promise<UsersConfig> {
    const [created] = await db.insert(usersConfigs).values(data).returning();

    if (!created) throw new Error("Failed to create user configuration");

    return created;
  }

  async update(userId: string, data: Partial<UsersConfigInsert>): Promise<UsersConfig> {
    const [updated] = await db
      .update(usersConfigs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(usersConfigs.userId, userId))
      .returning();

    if (!updated) {
      throw new Error("User configuration not found");
    }

    return updated;
  }

  async delete(userId: string): Promise<void> {
    await db.delete(usersConfigs).where(eq(usersConfigs.userId, userId));
  }

  async getConfig<K extends UserConfigKey>(userId: string, key: K): Promise<UserConfigValue<K> | null> {
    const config = await this.get(userId);
    if (!config) return null;
    return (config.configs[key] as UserConfigValue<K>) ?? null;
  }

  async setConfig<K extends UserConfigKey>(userId: string, key: K, value: UserConfigValue<K>): Promise<UsersConfig> {
    const config = await this.getOrCreate(userId);

    const updatedConfigs = {
      ...config.configs,
      [key]: value,
    } as UserConfigMap;

    return this.update(userId, { configs: updatedConfigs });
  }

  async updateConfigs(userId: string, partialConfigs: Partial<UserConfigMap>): Promise<UsersConfig> {
    const config = await this.getOrCreate(userId);

    const updatedConfigs = {
      ...config.configs,
      ...partialConfigs,
    } as UserConfigMap;

    return this.update(userId, { configs: updatedConfigs });
  }
}

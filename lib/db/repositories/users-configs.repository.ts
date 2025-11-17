import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { usersConfigs, type UsersConfig, type UsersConfigInsert } from "@/lib/db/schema";

/**
 * Users configurations repository using Drizzle ORM
 * Manages user preferences and settings
 * Note: User data itself is managed by Supabase Auth (auth.users)
 */
export class UsersConfigsRepository {
  /**
   * Get user configuration
   */
  async get(userId: string): Promise<UsersConfig | null> {
    const [config] = await db.select().from(usersConfigs).where(eq(usersConfigs.userId, userId)).limit(1);

    return config || null;
  }

  /**
   * Get or create user configuration with defaults
   */
  async getOrCreate(userId: string): Promise<UsersConfig> {
    let config = await this.get(userId);

    if (!config) {
      config = await this.create({ userId, emailOnNewReview: "true" });
    }

    return config;
  }

  /**
   * Create user configuration
   */
  async create(data: UsersConfigInsert): Promise<UsersConfig> {
    const [created] = await db.insert(usersConfigs).values(data).returning();

    if (!created) throw new Error("Failed to create user configuration");

    return created;
  }

  /**
   * Update user configuration
   */
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

  /**
   * Delete user configuration
   */
  async delete(userId: string): Promise<void> {
    await db.delete(usersConfigs).where(eq(usersConfigs.userId, userId));
  }
}

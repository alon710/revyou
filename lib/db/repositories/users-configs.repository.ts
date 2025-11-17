import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { usersConfigs, type UsersConfig, type UsersConfigInsert } from "@/lib/db/schema";

export class UsersConfigsRepository {
  async get(userId: string): Promise<UsersConfig | null> {
    const [config] = await db.select().from(usersConfigs).where(eq(usersConfigs.userId, userId)).limit(1);

    return config || null;
  }

  async getOrCreate(userId: string): Promise<UsersConfig> {
    let config = await this.get(userId);

    if (!config) {
      config = await this.create({ userId, emailOnNewReview: "true" });
    }

    return config;
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
}

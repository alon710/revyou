import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  businesses,
  businessConfigs,
  userAccounts,
  type Business,
  type BusinessInsert,
  type BusinessConfigInsert,
  type BusinessConfig,
} from "@/lib/db/schema";
import type { BusinessFilters, BusinessConfig as BusinessConfigType } from "@/lib/types";
import { BaseRepository } from "./base.repository";

export type BusinessWithConfig = Business & {
  config: BusinessConfigType;
};

function transformConfig(config: BusinessConfig): BusinessConfigType {
  return {
    name: config.name,
    description: config.description || undefined,
    phoneNumber: config.phoneNumber || undefined,
    toneOfVoice: config.toneOfVoice as "friendly" | "formal" | "humorous" | "professional",
    useEmojis: config.useEmojis,
    languageMode: config.languageMode as "hebrew" | "english" | "auto-detect",
    languageInstructions: config.languageInstructions || undefined,
    maxSentences: config.maxSentences || undefined,
    allowedEmojis: config.allowedEmojis || undefined,
    signature: config.signature || undefined,
    starConfigs: config.starConfigs,
  };
}

export class BusinessesRepository extends BaseRepository<BusinessInsert, BusinessWithConfig, Partial<Business>> {
  constructor(
    private userId: string,
    private accountId: string
  ) {
    super();
  }

  private async verifyAccess(): Promise<boolean> {
    const access = await db.query.userAccounts.findFirst({
      where: and(eq(userAccounts.userId, this.userId), eq(userAccounts.accountId, this.accountId)),
    });
    return !!access;
  }

  async get(businessId: string): Promise<BusinessWithConfig | null> {
    if (!(await this.verifyAccess())) return null;

    const result = await db.query.businesses.findFirst({
      where: and(eq(businesses.id, businessId), eq(businesses.accountId, this.accountId)),
      with: { config: true },
    });

    if (!result || !result.config) {
      if (result) throw new Error(`Business ${businessId} has no configuration`);
      return null;
    }

    return {
      ...result,
      config: transformConfig(result.config),
    };
  }

  async list(filters: BusinessFilters = {}): Promise<BusinessWithConfig[]> {
    if (!(await this.verifyAccess())) return [];

    const conditions = [eq(businesses.accountId, this.accountId)];

    if (filters.connected !== undefined) {
      conditions.push(eq(businesses.connected, filters.connected));
    }

    if (filters.ids && filters.ids.length > 0) {
      conditions.push(inArray(businesses.id, filters.ids));
    }

    const results = await db.query.businesses.findMany({
      where: and(...conditions),
      with: { config: true },
    });

    return results.map((result) => {
      if (!result.config) {
        throw new Error(`Business ${result.id} has no configuration`);
      }

      return {
        ...result,
        config: transformConfig(result.config),
      };
    });
  }

  async create(data: BusinessInsert & { config: BusinessConfigType }): Promise<BusinessWithConfig> {
    if (!(await this.verifyAccess())) throw new Error("Access denied");

    return await db.transaction(async (tx) => {
      const [business] = await tx.insert(businesses).values(data).returning();

      const configData: BusinessConfigInsert = {
        businessId: business.id,
        name: data.config.name,
        description: data.config.description,
        phoneNumber: data.config.phoneNumber,
        toneOfVoice: data.config.toneOfVoice,
        useEmojis: data.config.useEmojis,
        languageMode: data.config.languageMode,
        languageInstructions: data.config.languageInstructions,
        maxSentences: data.config.maxSentences,
        allowedEmojis: data.config.allowedEmojis,
        signature: data.config.signature,
        starConfigs: data.config.starConfigs,
      };

      const [config] = await tx.insert(businessConfigs).values(configData).returning();

      return {
        ...business,
        config: transformConfig(config),
      };
    });
  }

  async update(businessId: string, data: Partial<Business>): Promise<BusinessWithConfig> {
    await db.update(businesses).set(data).where(eq(businesses.id, businessId));

    const updated = await this.get(businessId);
    if (!updated) throw new Error("Business not found after update");

    return updated;
  }

  async delete(businessId: string): Promise<void> {
    await db.delete(businesses).where(eq(businesses.id, businessId));
  }

  async findByGoogleBusinessId(googleBusinessId: string): Promise<BusinessWithConfig | null> {
    if (!(await this.verifyAccess())) return null;

    const result = await db.query.businesses.findFirst({
      where: and(eq(businesses.googleBusinessId, googleBusinessId), eq(businesses.accountId, this.accountId)),
      with: { config: true },
    });

    if (!result || !result.config) return null;

    return {
      ...result,
      config: transformConfig(result.config),
    };
  }

  async disconnect(businessId: string): Promise<BusinessWithConfig> {
    return this.update(businessId, { connected: false });
  }

  async reconnect(
    businessId: string,
    data: {
      address: string;
      mapsUrl: string | null;
    }
  ): Promise<BusinessWithConfig> {
    await db
      .update(businesses)
      .set({
        address: data.address,
        mapsUrl: data.mapsUrl,
        connected: true,
        connectedAt: new Date(),
      })
      .where(eq(businesses.id, businessId));

    const updated = await this.get(businessId);
    if (!updated) throw new Error("Business not found after reconnect");

    return updated;
  }

  async updateConfig(businessId: string, configUpdate: Partial<BusinessConfigType>): Promise<BusinessWithConfig> {
    const business = await this.get(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    const updatedConfig = { ...business.config, ...configUpdate };

    await db
      .update(businessConfigs)
      .set({
        name: updatedConfig.name,
        description: updatedConfig.description,
        phoneNumber: updatedConfig.phoneNumber,
        toneOfVoice: updatedConfig.toneOfVoice,
        useEmojis: updatedConfig.useEmojis,
        languageMode: updatedConfig.languageMode,
        languageInstructions: updatedConfig.languageInstructions,
        maxSentences: updatedConfig.maxSentences,
        allowedEmojis: updatedConfig.allowedEmojis,
        signature: updatedConfig.signature,
        starConfigs: updatedConfig.starConfigs,
        updatedAt: new Date(),
      })
      .where(eq(businessConfigs.businessId, businessId));

    const updated = await this.get(businessId);
    if (!updated) throw new Error("Business not found after config update");

    return updated;
  }
}

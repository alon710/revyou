import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  businesses,
  businessConfigs,
  userAccounts,
  type Business,
  type BusinessInsert,
  type BusinessConfigInsert,
} from "@/lib/db/schema";
import type { BusinessFilters, BusinessConfig as BusinessConfigType } from "@/lib/types";
import { BaseRepository } from "./base.repository";

export type BusinessWithConfig = Business & {
  config: BusinessConfigType;
  emailOnNewReview: boolean;
};

export class BusinessesRepository extends BaseRepository<BusinessInsert, BusinessWithConfig, Partial<Business>> {
  constructor(
    private userId: string,
    private accountId: string
  ) {
    super();
  }

  async get(businessId: string): Promise<BusinessWithConfig | null> {
    const result = await db
      .select()
      .from(businesses)
      .innerJoin(userAccounts, eq(businesses.accountId, userAccounts.accountId))
      .leftJoin(businessConfigs, eq(businesses.id, businessConfigs.businessId))
      .where(
        and(
          eq(businesses.id, businessId),
          eq(businesses.accountId, this.accountId),
          eq(userAccounts.userId, this.userId)
        )
      )
      .limit(1);

    if (result.length === 0) return null;

    const business = result[0].businesses;
    const config = result[0].business_configs;

    if (!config) {
      throw new Error(`Business ${businessId} has no configuration`);
    }

    return {
      ...business,
      config: {
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
      },
      emailOnNewReview: config.emailOnNewReview,
    } as BusinessWithConfig;
  }

  async list(filters: BusinessFilters = {}): Promise<BusinessWithConfig[]> {
    const query = db
      .select()
      .from(businesses)
      .innerJoin(userAccounts, eq(businesses.accountId, userAccounts.accountId))
      .leftJoin(businessConfigs, eq(businesses.id, businessConfigs.businessId))
      .where(and(eq(businesses.accountId, this.accountId), eq(userAccounts.userId, this.userId)));

    const results = await query;

    let businessList = results.map((r) => {
      const business = r.businesses;
      const config = r.business_configs;

      if (!config) {
        throw new Error(`Business ${business.id} has no configuration`);
      }

      return {
        ...business,
        config: {
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
        },
        emailOnNewReview: config.emailOnNewReview,
      } as BusinessWithConfig;
    });

    if (filters.connected !== undefined) {
      businessList = businessList.filter((b) => b.connected === filters.connected);
    }

    if (filters.ids && filters.ids.length > 0) {
      const idSet = new Set(filters.ids);
      businessList = businessList.filter((b) => idSet.has(b.id));
    }

    return businessList;
  }

  async create(
    data: BusinessInsert & { config: BusinessConfigType; emailOnNewReview: boolean }
  ): Promise<BusinessWithConfig> {
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
        emailOnNewReview: data.emailOnNewReview,
      };

      await tx.insert(businessConfigs).values(configData);

      const result = await tx
        .select()
        .from(businesses)
        .innerJoin(userAccounts, eq(businesses.accountId, userAccounts.accountId))
        .leftJoin(businessConfigs, eq(businesses.id, businessConfigs.businessId))
        .where(
          and(
            eq(businesses.id, business.id),
            eq(businesses.accountId, this.accountId),
            eq(userAccounts.userId, this.userId)
          )
        )
        .limit(1);

      if (result.length === 0) throw new Error("Failed to create business");

      const createdBusiness = result[0].businesses;
      const config = result[0].business_configs;

      if (!config) {
        throw new Error(`Business ${business.id} has no configuration`);
      }

      return {
        ...createdBusiness,
        config: {
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
        },
        emailOnNewReview: config.emailOnNewReview,
      } as BusinessWithConfig;
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
    const results = await db
      .select()
      .from(businesses)
      .innerJoin(userAccounts, eq(businesses.accountId, userAccounts.accountId))
      .leftJoin(businessConfigs, eq(businesses.id, businessConfigs.businessId))
      .where(
        and(
          eq(businesses.googleBusinessId, googleBusinessId),
          eq(businesses.accountId, this.accountId),
          eq(userAccounts.userId, this.userId)
        )
      )
      .limit(1);

    if (results.length === 0) return null;

    const business = results[0].businesses;
    const config = results[0].business_configs;

    if (!config) return null;

    return {
      ...business,
      config: {
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
      },
      emailOnNewReview: config.emailOnNewReview,
    } as BusinessWithConfig;
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

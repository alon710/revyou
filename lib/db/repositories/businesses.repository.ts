import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businesses, userAccounts, type Business, type BusinessInsert } from "@/lib/db/schema";
import type { BusinessFilters } from "@/lib/types";
import { BaseRepository } from "./base.repository";
import { NotFoundError } from "@/lib/api/errors";

export class BusinessesRepository extends BaseRepository<BusinessInsert, Business, Partial<Business>> {
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

  async get(businessId: string): Promise<Business | null> {
    if (!(await this.verifyAccess())) return null;

    const result = await db.query.businesses.findFirst({
      where: and(eq(businesses.id, businessId), eq(businesses.accountId, this.accountId)),
    });

    return result || null;
  }

  async list(filters: BusinessFilters = {}): Promise<Business[]> {
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
    });

    return results;
  }

  async create(data: BusinessInsert): Promise<Business> {
    if (!(await this.verifyAccess())) throw new Error("Access denied");

    const [business] = await db.insert(businesses).values(data).returning();

    return business;
  }

  async update(businessId: string, data: Partial<Business>): Promise<Business> {
    if (!(await this.verifyAccess())) {
      throw new NotFoundError("Access denied");
    }

    const [updated] = await db
      .update(businesses)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(businesses.id, businessId), eq(businesses.accountId, this.accountId)))
      .returning();

    if (!updated) {
      throw new NotFoundError("Business not found or access denied");
    }

    return updated;
  }

  async delete(businessId: string): Promise<void> {
    if (!(await this.verifyAccess())) {
      throw new NotFoundError("Access denied");
    }

    const [deleted] = await db
      .delete(businesses)
      .where(and(eq(businesses.id, businessId), eq(businesses.accountId, this.accountId)))
      .returning();

    if (!deleted) {
      throw new NotFoundError("Business not found or access denied");
    }
  }

  async findByGoogleBusinessId(googleBusinessId: string): Promise<Business | null> {
    if (!(await this.verifyAccess())) return null;

    const result = await db.query.businesses.findFirst({
      where: and(eq(businesses.googleBusinessId, googleBusinessId), eq(businesses.accountId, this.accountId)),
    });

    return result || null;
  }

  async disconnect(businessId: string): Promise<Business> {
    if (!(await this.verifyAccess())) {
      throw new NotFoundError("Access denied");
    }

    return this.update(businessId, { connected: false });
  }

  async reconnect(
    businessId: string,
    data: {
      address: string;
      mapsUrl: string | null;
    }
  ): Promise<Business> {
    if (!(await this.verifyAccess())) {
      throw new NotFoundError("Access denied");
    }

    return this.update(businessId, {
      address: data.address,
      mapsUrl: data.mapsUrl,
      connected: true,
      connectedAt: new Date(),
    });
  }
}

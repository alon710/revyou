import type { BusinessFilters, Business, BusinessCreate, BusinessUpdate } from "@/lib/types";
import { BusinessesRepository } from "@/lib/db/repositories";
import { ConflictError, ForbiddenError } from "@/lib/api/errors";

export class BusinessesController {
  private repository: BusinessesRepository;

  constructor(userId: string, accountId: string) {
    this.repository = new BusinessesRepository(userId, accountId);
  }

  async getBusinesses(filters: BusinessFilters = {}): Promise<Business[]> {
    return this.repository.list(filters);
  }

  async getBusiness(businessId: string): Promise<Business> {
    const business = await this.repository.get(businessId);
    if (!business) throw new Error("Business not found");
    return business;
  }

  async createBusiness(data: BusinessCreate): Promise<Business> {
    const existingBusiness = await this.repository.findByGoogleBusinessId(data.googleBusinessId);
    if (existingBusiness) {
      throw new ConflictError("העסק כבר מחובר לחשבון זה");
    }
    return this.repository.create(data);
  }

  async upsertBusiness(data: BusinessCreate, checkLimit?: () => Promise<boolean>): Promise<Business> {
    const existingBusinessGlobal = await this.repository.findByGoogleBusinessIdGlobal(data.googleBusinessId);

    if (existingBusinessGlobal) {
      const business = await this.repository.findOrCreate(data);

      await this.repository.update(business.id, data);
      return this.repository.reconnect(business.id, {
        address: data.address,
        mapsUrl: data.mapsUrl ?? null,
      });
    }

    if (checkLimit) {
      const canCreate = await checkLimit();
      if (!canCreate) {
        throw new ForbiddenError("הגעת למגבלת העסקים בתוכנית הנוכחית. שדרג את התוכנית כדי להוסיף עסקים נוספים.");
      }
    }

    return this.repository.findOrCreate(data);
  }

  async updateBusiness(businessId: string, data: BusinessUpdate): Promise<Business> {
    await this.getBusiness(businessId);
    return this.repository.update(businessId, data);
  }

  async deleteBusiness(businessId: string): Promise<void> {
    await this.getBusiness(businessId);
    return this.repository.delete(businessId);
  }

  async disconnectBusiness(businessId: string): Promise<Business> {
    await this.getBusiness(businessId);
    return this.repository.disconnect(businessId);
  }

  async checkExists(googleBusinessId: string): Promise<boolean> {
    const business = await this.repository.findByGoogleBusinessId(googleBusinessId);
    return business !== null;
  }

  async findByGoogleBusinessId(googleBusinessId: string): Promise<Business | null> {
    return this.repository.findByGoogleBusinessId(googleBusinessId);
  }
}

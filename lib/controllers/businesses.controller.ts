import type {
  BusinessCreate,
  Business,
  BusinessUpdate,
  BusinessFilters,
} from "@/lib/types";
import { BusinessesRepositoryAdmin } from "@/lib/repositories/businesses.repository.admin";
import { BaseController } from "./base.controller";
import { BadRequestError } from "@/lib/api/errors";

export class BusinessesController extends BaseController<
  BusinessCreate,
  Business,
  BusinessUpdate
> {
  private userId: string;
  private accountId: string;

  constructor(userId: string, accountId: string) {
    const repository = new BusinessesRepositoryAdmin(userId, accountId);
    super(repository);
    this.userId = userId;
    this.accountId = accountId;
  }

  async getBusinesses(filters: BusinessFilters = {}): Promise<Business[]> {
    return this.handleError(
      () => this.repository.list(filters),
      "Failed to fetch businesses"
    );
  }

  async getBusiness(businessId: string): Promise<Business> {
    return this.ensureExists(businessId, "Business");
  }

  async createBusiness(data: BusinessCreate): Promise<Business> {
    return this.handleError(async () => {
      const repo = this.repository as BusinessesRepositoryAdmin;

      const existingBusiness = await repo.findByGoogleBusinessId(
        data.googleBusinessId
      );
      if (existingBusiness) {
        throw new BadRequestError("Business already connected to this account");
      }

      return this.repository.create(data);
    }, "Failed to create business");
  }

  async updateBusiness(
    businessId: string,
    data: BusinessUpdate
  ): Promise<Business> {
    return this.handleError(async () => {
      await this.ensureExists(businessId, "Business");
      return this.repository.update(businessId, data);
    }, "Failed to update business");
  }

  async deleteBusiness(businessId: string): Promise<void> {
    return this.handleError(async () => {
      await this.ensureExists(businessId, "Business");
      return this.repository.delete(businessId);
    }, "Failed to delete business");
  }

  async disconnectBusiness(businessId: string): Promise<Business> {
    const repo = this.repository as BusinessesRepositoryAdmin;
    return this.handleError(
      () => repo.disconnect(businessId),
      "Failed to disconnect business"
    );
  }

  async checkExists(googleBusinessId: string): Promise<boolean> {
    const repo = this.repository as BusinessesRepositoryAdmin;
    const business = await repo.findByGoogleBusinessId(googleBusinessId);
    return business !== null;
  }

  async findByGoogleBusinessId(
    googleBusinessId: string
  ): Promise<Business | null> {
    const repo = this.repository as BusinessesRepositoryAdmin;
    return repo.findByGoogleBusinessId(googleBusinessId);
  }
}

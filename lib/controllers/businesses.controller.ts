import type {
  BusinessCreate,
  Business,
  BusinessUpdate,
  BusinessFilters,
} from "@/lib/types";
import { BusinessesRepositoryAdmin } from "@/lib/repositories/businesses.repository.admin";
import { BaseController } from "./base.controller";

/**
 * Businesses Controller
 * Handles business logic for business operations
 * Includes business limit checking and duplicate detection
 */
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

  /**
   * Get businesses with optional filters
   */
  async getBusinesses(filters: BusinessFilters = {}): Promise<Business[]> {
    return this.handleError(
      () => this.repository.list(filters),
      "Failed to fetch businesses"
    );
  }

  /**
   * Get a single business by ID
   */
  async getBusiness(businessId: string): Promise<Business> {
    return this.ensureExists(businessId, "Business");
  }

  /**
   * Create a new business
   * Includes validation:
   * - Check subscription limits
   * - Check for duplicate Google Business ID
   */
  async createBusiness(data: BusinessCreate): Promise<Business> {
    return this.handleError(async () => {
      const repo = this.repository as BusinessesRepositoryAdmin;

      // Check if business already exists
      const exists = await repo.existsByGoogleId(data.googleBusinessId);
      if (exists) {
        throw new Error("Business already connected to this account");
      }

      // Note: Business limit checking should be done at API route level
      // as it requires access to subscription data

      return this.repository.create(data);
    }, "Failed to create business");
  }

  /**
   * Update an existing business
   */
  async updateBusiness(
    businessId: string,
    data: BusinessUpdate
  ): Promise<Business> {
    return this.handleError(async () => {
      await this.ensureExists(businessId, "Business");
      return this.repository.update(businessId, data);
    }, "Failed to update business");
  }

  /**
   * Delete a business
   * Note: This should cascade delete all reviews
   */
  async deleteBusiness(businessId: string): Promise<void> {
    return this.handleError(async () => {
      await this.ensureExists(businessId, "Business");
      return this.repository.delete(businessId);
    }, "Failed to delete business");
  }

  /**
   * Disconnect a business (soft delete - marks as not connected)
   */
  async disconnectBusiness(businessId: string): Promise<Business> {
    const repo = this.repository as BusinessesRepositoryAdmin;
    return this.handleError(
      () => repo.disconnect(businessId),
      "Failed to disconnect business"
    );
  }

  /**
   * Check if business already exists by Google Business ID
   */
  async checkExists(googleBusinessId: string): Promise<boolean> {
    const repo = this.repository as BusinessesRepositoryAdmin;
    return repo.existsByGoogleId(googleBusinessId);
  }

  /**
   * Find business by Google Business ID
   */
  async findByGoogleBusinessId(
    googleBusinessId: string
  ): Promise<Business | null> {
    const repo = this.repository as BusinessesRepositoryAdmin;
    return repo.findByGoogleBusinessId(googleBusinessId);
  }
}

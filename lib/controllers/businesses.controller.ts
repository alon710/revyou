import type { BusinessCreate, Business, BusinessUpdate, BusinessFilters, BusinessConfig } from "@/lib/types";
import { BusinessesRepositoryAdmin } from "@/lib/repositories/businesses.repository.admin";
import { BaseController } from "./base.controller";
import { ConflictError, ForbiddenError } from "@/lib/api/errors";
import { getAdminDb } from "@/lib/firebase/admin";
import * as admin from "firebase-admin";

export class BusinessesController extends BaseController<BusinessCreate, Business, BusinessUpdate> {
  private userId: string;
  private accountId: string;

  constructor(userId: string, accountId: string) {
    const repository = new BusinessesRepositoryAdmin(userId, accountId);
    super(repository);
    this.userId = userId;
    this.accountId = accountId;
  }

  async getBusinesses(filters: BusinessFilters = {}): Promise<Business[]> {
    return this.handleError(() => this.repository.list(filters), "Failed to fetch businesses");
  }

  async getBusiness(businessId: string): Promise<Business> {
    return this.ensureExists(businessId, "Business");
  }

  async createBusiness(data: BusinessCreate): Promise<Business> {
    return this.handleError(async () => {
      const repo = this.repository as BusinessesRepositoryAdmin;

      const existingBusiness = await repo.findByGoogleBusinessId(data.googleBusinessId);
      if (existingBusiness) {
        throw new ConflictError("העסק כבר מחובר לחשבון זה");
      }

      return this.repository.create(data);
    }, "Failed to create business");
  }

  async upsertBusiness(data: BusinessCreate, checkLimit?: () => Promise<boolean>): Promise<Business> {
    return this.handleError(async () => {
      const repo = this.repository as BusinessesRepositoryAdmin;

      const existingBusiness = await repo.findByGoogleBusinessId(data.googleBusinessId);

      if (existingBusiness) {
        await this.repository.update(existingBusiness.id, {
          name: data.name,
          phoneNumber: data.phoneNumber,
          websiteUrl: data.websiteUrl,
          description: data.description,
          photoUrl: data.photoUrl,
          config: data.config,
        });

        return repo.reconnect(existingBusiness.id, {
          address: data.address,
          mapsUrl: data.mapsUrl,
        });
      }

      if (checkLimit) {
        const basePath = `users/${this.userId}/accounts/${this.accountId}/businesses`;
        const collectionRef = getAdminDb().collection(basePath);

        const businessId = await getAdminDb().runTransaction(async (transaction) => {
          const querySnapshot = await transaction.get(
            collectionRef.where("googleBusinessId", "==", data.googleBusinessId).limit(1)
          );

          if (!querySnapshot.empty) {
            const existingDoc = querySnapshot.docs[0];
            transaction.update(existingDoc.ref, {
              name: data.name,
              phoneNumber: data.phoneNumber,
              websiteUrl: data.websiteUrl,
              description: data.description,
              photoUrl: data.photoUrl,
              config: data.config,
              address: data.address,
              mapsUrl: data.mapsUrl,
              connected: true,
              connectedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return existingDoc.id;
          }

          const canCreate = await checkLimit();
          if (!canCreate) {
            throw new ForbiddenError("הגעת למגבלת העסקים בתוכנית הנוכחית. שדרג את התוכנית כדי להוסיף עסקים נוספים.");
          }

          const newBusinessRef = collectionRef.doc();
          const businessData = {
            ...data,
            connected: true,
            connectedAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          transaction.set(newBusinessRef, businessData);
          return newBusinessRef.id;
        });

        const business = await repo.get(businessId);
        if (!business) throw new Error("Failed to create/update business");
        return business;
      } else {
        return this.repository.create(data);
      }
    }, "Failed to upsert business");
  }

  async updateBusiness(businessId: string, data: BusinessUpdate): Promise<Business> {
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
    return this.handleError(() => repo.disconnect(businessId), "Failed to disconnect business");
  }

  async checkExists(googleBusinessId: string): Promise<boolean> {
    const repo = this.repository as BusinessesRepositoryAdmin;
    const business = await repo.findByGoogleBusinessId(googleBusinessId);
    return business !== null;
  }

  async findByGoogleBusinessId(googleBusinessId: string): Promise<Business | null> {
    const repo = this.repository as BusinessesRepositoryAdmin;
    return repo.findByGoogleBusinessId(googleBusinessId);
  }

  async updateConfig(businessId: string, config: Partial<BusinessConfig>): Promise<Business> {
    const repo = this.repository as BusinessesRepositoryAdmin;
    return this.handleError(() => repo.updateConfig(businessId, config), "Failed to update business config");
  }
}

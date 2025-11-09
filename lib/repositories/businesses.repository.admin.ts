import { adminDb } from "@/lib/firebase/admin";
import type {
  BusinessCreate,
  Business,
  BusinessUpdate,
  BusinessUpdateInput,
  BusinessFilters,
} from "@/lib/types";
import { firestorePaths } from "@/lib/utils/firestore-paths";
import { AdminQueryBuilder } from "@/lib/utils/query-builder";
import { BaseRepository } from "./base.repository";

export class BusinessesRepositoryAdmin extends BaseRepository<
  BusinessCreate,
  Business,
  BusinessUpdate
> {
  private userId: string;
  private accountId: string;

  constructor(userId: string, accountId: string) {
    super(firestorePaths.businesses(userId, accountId));
    this.userId = userId;
    this.accountId = accountId;
  }

  async get(businessId: string): Promise<Business | null> {
    const businessRef = adminDb.doc(`${this.basePath}/${businessId}`);
    const snapshot = await businessRef.get();

    if (!snapshot.exists) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Business;
  }

  async list(filters: BusinessFilters = {}): Promise<Business[]> {
    const collectionRef = adminDb.collection(this.basePath);
    const q = AdminQueryBuilder.buildBusinessQuery(collectionRef, filters);
    const snapshot = await q.get();

    let businesses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Business[];

    if (filters.ids) {
      const idSet = new Set(filters.ids);
      businesses = businesses.filter((b) => idSet.has(b.id));
    }

    return businesses;
  }

  async create(data: BusinessCreate): Promise<Business> {
    const collectionRef = adminDb.collection(this.basePath);

    const businessData = {
      ...data,
      connected: true,
      connectedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await collectionRef.add(businessData);
    const created = await this.get(docRef.id);

    if (!created) throw new Error("Failed to create business");

    return created;
  }

  async update(
    businessId: string,
    data: BusinessUpdateInput
  ): Promise<Business> {
    const businessRef = adminDb.doc(`${this.basePath}/${businessId}`);
    await businessRef.update(data);

    const updated = await this.get(businessId);
    if (!updated) throw new Error("Business not found after update");

    return updated;
  }

  async delete(businessId: string): Promise<void> {
    const businessRef = adminDb.doc(`${this.basePath}/${businessId}`);
    await businessRef.delete();
  }

  async findByGoogleBusinessId(
    googleBusinessId: string
  ): Promise<Business | null> {
    const collectionRef = adminDb.collection(this.basePath);
    const snapshot = await collectionRef
      .where("googleBusinessId", "==", googleBusinessId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as Business;
  }

  async disconnect(businessId: string): Promise<Business> {
    return this.update(businessId, {
      connected: false,
    });
  }

  async updateConfig(businessId: string, config: any): Promise<Business> {
    const business = await this.get(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    const updatedConfig = { ...business.config, ...config };
    return this.update(businessId, { config: updatedConfig });
  }
}

"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { BusinessesController, SubscriptionsController } from "@/lib/controllers";
import type { Business, BusinessCreate, BusinessUpdate, BusinessFilters, BusinessConfig } from "@/lib/types";
import { getDefaultBusinessConfig } from "@/lib/utils/business-config";

export async function getBusinesses(
  userId: string,
  accountId: string,
  filters: BusinessFilters = {}
): Promise<Business[]> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const controller = new BusinessesController(userId, accountId);
  return controller.getBusinesses(filters);
}

export async function getBusiness(userId: string, accountId: string, businessId: string): Promise<Business> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const controller = new BusinessesController(userId, accountId);
  return controller.getBusiness(businessId);
}

export async function upsertBusiness(
  userId: string,
  accountId: string,
  data: Omit<BusinessCreate, "accountId" | "config"> & {
    config?: Partial<BusinessConfig>;
  }
): Promise<Business> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot create business for another user");
  }

  const controller = new BusinessesController(userId, accountId);
  const subscriptionsController = new SubscriptionsController();

  const defaultConfig = getDefaultBusinessConfig();
  const businessConfig = {
    ...defaultConfig,
    ...data.config,
    name: data.config?.name || data.name,
    description: data.config?.description || data.description || "",
    phoneNumber: data.config?.phoneNumber || data.phoneNumber || "",
  };

  const businessData: BusinessCreate = {
    accountId,
    googleBusinessId: data.googleBusinessId,
    name: data.name,
    address: data.address,
    phoneNumber: data.phoneNumber || null,
    websiteUrl: data.websiteUrl || null,
    mapsUrl: data.mapsUrl || null,
    description: data.description || null,
    photoUrl: data.photoUrl || null,
    config: businessConfig,
  };

  return controller.upsertBusiness(businessData, () => subscriptionsController.checkBusinessLimit(userId));
}

export async function updateBusiness(
  userId: string,
  accountId: string,
  businessId: string,
  data: BusinessUpdate
): Promise<Business> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot update another user's business");
  }

  const controller = new BusinessesController(userId, accountId);
  return controller.updateBusiness(businessId, data);
}

export async function updateBusinessConfig(
  userId: string,
  accountId: string,
  businessId: string,
  config: Partial<BusinessConfig>
): Promise<Business> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot update another user's business");
  }

  const controller = new BusinessesController(userId, accountId);
  return controller.updateConfig(businessId, config);
}

export async function deleteBusiness(userId: string, accountId: string, businessId: string): Promise<void> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot delete another user's business");
  }

  const controller = new BusinessesController(userId, accountId);
  return controller.deleteBusiness(businessId);
}

export async function disconnectBusiness(userId: string, accountId: string, businessId: string): Promise<Business> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot disconnect another user's business");
  }

  const controller = new BusinessesController(userId, accountId);
  return controller.disconnectBusiness(businessId);
}

export async function checkBusinessExists(
  userId: string,
  accountId: string,
  googleBusinessId: string
): Promise<boolean> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const controller = new BusinessesController(userId, accountId);
  return controller.checkExists(googleBusinessId);
}

"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { UsersController } from "@/lib/controllers";
import type { UserConfig, UserConfigUpdate } from "@/lib/types";

export async function getUserConfig(userId: string): Promise<UserConfig> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const controller = new UsersController();
  return controller.getUserConfig(userId);
}

export async function updateUserConfig(userId: string, data: UserConfigUpdate): Promise<UserConfig> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot update another user's data");
  }

  const controller = new UsersController();
  return controller.updateUserConfig(userId, data);
}

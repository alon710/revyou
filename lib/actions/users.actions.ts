"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { UsersController } from "@/lib/controllers";
import type { User, UserUpdate } from "@/lib/types";

export async function getUser(userId: string): Promise<User> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const controller = new UsersController();
  return controller.getUser(userId);
}

export async function updateUser(userId: string, data: UserUpdate): Promise<User> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot update another user's data");
  }

  const controller = new UsersController();
  return controller.updateUser(userId, data);
}

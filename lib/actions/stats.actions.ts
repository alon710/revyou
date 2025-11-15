"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { StatsController, type UserStats } from "@/lib/controllers/stats.controller";

export async function getUserStats(userId: string): Promise<UserStats> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const controller = new StatsController();
  return controller.getUserStats(userId);
}

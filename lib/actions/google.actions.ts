"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { AccountsController, BusinessesController } from "@/lib/controllers";
import { listAllBusinesses, decryptToken, subscribeToNotifications } from "@/lib/google/business-profile";
import type { GoogleBusinessProfileBusiness } from "@/lib/types";
import { env } from "@/lib/env";

export async function getGoogleBusinesses(userId: string, accountId: string): Promise<GoogleBusinessProfileBusiness[]> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const accountsController = new AccountsController(userId);
  const account = await accountsController.getAccount(accountId);

  if (!account.googleRefreshToken) {
    throw new Error("No Google refresh token found");
  }

  const refreshToken = await decryptToken(account.googleRefreshToken);
  return listAllBusinesses(refreshToken);
}

export async function subscribeToGoogleNotifications(
  userId: string,
  accountId: string
): Promise<{ success: boolean; alreadySubscribed?: boolean }> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const accountsController = new AccountsController(userId);
  const businessesController = new BusinessesController(userId, accountId);

  const account = await accountsController.getAccount(accountId);

  if (!account) {
    throw new Error("Account not found");
  }

  if (account.googleAccountName) {
    return { success: true, alreadySubscribed: true };
  }

  if (!account.googleRefreshToken) {
    throw new Error("Missing Google refresh token");
  }

  const businesses = await businessesController.getBusinesses();
  if (businesses.length === 0) {
    throw new Error("No businesses found");
  }

  const googleAccountName = businesses[0].googleBusinessId.split("/locations")[0];

  const projectId = env.NEXT_PUBLIC_GCP_PROJECT_ID;
  const topicName = env.PUBSUB_TOPIC_NAME;
  const pubsubTopic = `projects/${projectId}/topics/${topicName}`;

  const refreshToken = await decryptToken(account.googleRefreshToken);

  await subscribeToNotifications(googleAccountName, pubsubTopic, refreshToken);

  await accountsController.updateAccount(accountId, { googleAccountName });

  return { success: true };
}

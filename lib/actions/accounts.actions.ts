"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { AccountsController } from "@/lib/controllers";
import type {
  Account,
  AccountCreate,
  AccountUpdate,
  AccountFilters,
  AccountWithBusinesses,
  BusinessFilters,
} from "@/lib/types";

export async function getAccounts(userId: string, filters: AccountFilters = {}): Promise<Account[]> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const controller = new AccountsController(userId);
  return controller.getAccounts(filters);
}

export async function getAccount(userId: string, accountId: string): Promise<Account> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const controller = new AccountsController(userId);
  return controller.getAccount(accountId);
}

export async function createAccount(userId: string, data: AccountCreate): Promise<Account> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot create account for another user");
  }

  const controller = new AccountsController(userId);
  return controller.createAccount(data);
}

export async function updateAccount(userId: string, accountId: string, data: AccountUpdate): Promise<Account> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot update another user's account");
  }

  const controller = new AccountsController(userId);
  return controller.updateAccount(accountId, data);
}

export async function deleteAccount(userId: string, accountId: string): Promise<void> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot delete another user's account");
  }

  const controller = new AccountsController(userId);
  return controller.deleteAccount(accountId);
}

export async function getAccountsWithBusinesses(
  accountFilters: AccountFilters = {},
  businessFilters: BusinessFilters = {}
): Promise<AccountWithBusinesses[]> {
  const { userId } = await getAuthenticatedUserId();

  const controller = new AccountsController(userId);
  return controller.getAccountsWithBusinesses(accountFilters, businessFilters);
}

export async function updateAccountLastSynced(userId: string, accountId: string): Promise<Account> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot update another user's account");
  }

  const controller = new AccountsController(userId);
  return controller.updateLastSynced(accountId);
}

export async function updateAccountRefreshToken(
  userId: string,
  accountId: string,
  refreshToken: string
): Promise<Account> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot update another user's account");
  }

  const controller = new AccountsController(userId);
  return controller.updateRefreshToken(accountId, refreshToken);
}

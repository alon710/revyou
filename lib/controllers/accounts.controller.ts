import type {
  AccountCreate,
  Account,
  AccountUpdate,
  AccountFilters,
} from "@/lib/types";
import { AccountsRepositoryAdmin } from "@/lib/repositories/accounts.repository.admin";
import { BaseController } from "./base.controller";

/**
 * Accounts Controller
 * Handles business logic for account operations
 * Includes OAuth token management
 */
export class AccountsController extends BaseController<
  AccountCreate,
  Account,
  AccountUpdate
> {
  private userId: string;

  constructor(userId: string) {
    const repository = new AccountsRepositoryAdmin(userId);
    super(repository);
    this.userId = userId;
  }

  /**
   * Get accounts with optional filters
   */
  async getAccounts(filters: AccountFilters = {}): Promise<Account[]> {
    return this.handleError(
      () => this.repository.list(filters),
      "Failed to fetch accounts"
    );
  }

  /**
   * Get a single account by ID
   */
  async getAccount(accountId: string): Promise<Account> {
    return this.ensureExists(accountId, "Account");
  }

  /**
   * Create a new account (typically during OAuth flow)
   */
  async createAccount(data: AccountCreate): Promise<Account> {
    return this.handleError(async () => {
      const repo = this.repository as AccountsRepositoryAdmin;

      // Check if account with this email already exists
      const existing = await repo.findByEmail(data.email);
      if (existing) {
        // Update existing account with new token
        return repo.update(existing.id, {
          googleRefreshToken: data.googleRefreshToken,
          googleAccountName: data.googleAccountName,
        });
      }

      // Create new account
      return this.repository.create(data);
    }, "Failed to create account");
  }

  /**
   * Update an existing account
   */
  async updateAccount(
    accountId: string,
    data: AccountUpdate
  ): Promise<Account> {
    return this.handleError(async () => {
      await this.ensureExists(accountId, "Account");
      return this.repository.update(accountId, data);
    }, "Failed to update account");
  }

  /**
   * Delete an account
   * Note: This should cascade delete all businesses and reviews
   */
  async deleteAccount(accountId: string): Promise<void> {
    return this.handleError(async () => {
      await this.ensureExists(accountId, "Account");
      return this.repository.delete(accountId);
    }, "Failed to delete account");
  }

  /**
   * Find account by email address
   */
  async findByEmail(email: string): Promise<Account | null> {
    const repo = this.repository as AccountsRepositoryAdmin;
    return repo.findByEmail(email);
  }

  /**
   * Update last synced timestamp
   */
  async updateLastSynced(accountId: string): Promise<Account> {
    const repo = this.repository as AccountsRepositoryAdmin;
    return this.handleError(
      () => repo.updateLastSynced(accountId),
      "Failed to update last synced"
    );
  }

  /**
   * Update OAuth refresh token
   */
  async updateRefreshToken(
    accountId: string,
    refreshToken: string
  ): Promise<Account> {
    return this.updateAccount(accountId, {
      googleRefreshToken: refreshToken,
    });
  }
}

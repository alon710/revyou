import type {
  AccountCreate,
  Account,
  AccountUpdate,
  AccountFilters,
  AccountWithBusinesses,
  BusinessFilters,
} from "@/lib/types";
import { AccountsRepositoryAdmin } from "@/lib/repositories/accounts.repository.admin";
import { BusinessesRepositoryAdmin } from "@/lib/repositories/businesses.repository.admin";
import { BaseController } from "./base.controller";

export class AccountsController extends BaseController<AccountCreate, Account, AccountUpdate> {
  private userId: string;

  constructor(userId: string) {
    const repository = new AccountsRepositoryAdmin(userId);
    super(repository);
    this.userId = userId;
  }

  async getAccounts(filters: AccountFilters = {}): Promise<Account[]> {
    return this.handleError(() => this.repository.list(filters), "Failed to fetch accounts");
  }

  async getAccount(accountId: string): Promise<Account> {
    return this.ensureExists(accountId, "Account");
  }

  async createAccount(data: AccountCreate): Promise<Account> {
    return this.handleError(async () => {
      const repo = this.repository as AccountsRepositoryAdmin;

      const existing = await repo.findByEmail(data.email);
      if (existing) {
        return repo.update(existing.id, {
          googleRefreshToken: data.googleRefreshToken,
          googleAccountName: data.googleAccountName,
        });
      }

      return this.repository.create(data);
    }, "Failed to create account");
  }

  async updateAccount(accountId: string, data: AccountUpdate): Promise<Account> {
    return this.handleError(async () => {
      await this.ensureExists(accountId, "Account");
      return this.repository.update(accountId, data);
    }, "Failed to update account");
  }

  async deleteAccount(accountId: string): Promise<void> {
    return this.handleError(async () => {
      await this.ensureExists(accountId, "Account");
      return this.repository.delete(accountId);
    }, "Failed to delete account");
  }

  async findByEmail(email: string): Promise<Account | null> {
    const repo = this.repository as AccountsRepositoryAdmin;
    return repo.findByEmail(email);
  }

  async updateLastSynced(accountId: string): Promise<Account> {
    const repo = this.repository as AccountsRepositoryAdmin;
    return this.handleError(() => repo.updateLastSynced(accountId), "Failed to update last synced");
  }

  async updateRefreshToken(accountId: string, refreshToken: string): Promise<Account> {
    return this.updateAccount(accountId, {
      googleRefreshToken: refreshToken,
    });
  }

  async getAccountsWithBusinesses(
    accountFilters: AccountFilters = {},
    businessFilters: BusinessFilters = {}
  ): Promise<AccountWithBusinesses[]> {
    return this.handleError(async () => {
      const accounts = await this.repository.list(accountFilters);

      const accountsWithBusinesses = await Promise.all(
        accounts.map(async (account) => {
          const businessRepo = new BusinessesRepositoryAdmin(this.userId, account.id);
          const businesses = await businessRepo.list(businessFilters);

          return {
            ...account,
            businesses,
          };
        })
      );

      return accountsWithBusinesses;
    }, "Failed to fetch accounts with businesses");
  }
}

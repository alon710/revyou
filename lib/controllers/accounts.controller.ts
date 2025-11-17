import type { AccountFilters, AccountWithBusinesses, BusinessFilters } from "@/lib/types";
import { AccountsRepository, BusinessesRepository } from "@/lib/db/repositories";
import type { Account, AccountInsert } from "@/lib/db/schema";

export class AccountsController {
  private repository: AccountsRepository;
  private userId: string;

  constructor(userId: string) {
    this.repository = new AccountsRepository(userId);
    this.userId = userId;
  }

  async getAccounts(filters: AccountFilters = {}): Promise<Account[]> {
    return this.repository.list(filters);
  }

  async getAccount(accountId: string): Promise<Account> {
    const account = await this.repository.get(accountId);
    if (!account) throw new Error("Account not found");
    return account;
  }

  async createAccount(data: AccountInsert): Promise<Account> {
    const existing = await this.repository.findByEmail(data.email);
    if (existing) {
      return this.repository.update(existing.id, {
        googleRefreshToken: data.googleRefreshToken,
        googleAccountName: data.googleAccountName,
      });
    }
    return this.repository.create(data);
  }

  async updateAccount(accountId: string, data: Partial<Account>): Promise<Account> {
    await this.getAccount(accountId);
    return this.repository.update(accountId, data);
  }

  async deleteAccount(accountId: string): Promise<void> {
    await this.getAccount(accountId);
    return this.repository.delete(accountId);
  }

  async findByEmail(email: string): Promise<Account | null> {
    return this.repository.findByEmail(email);
  }

  async updateLastSynced(accountId: string): Promise<Account> {
    return this.repository.updateLastSynced(accountId);
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
    const accounts = await this.repository.list(accountFilters);

    const accountsWithBusinesses = await Promise.all(
      accounts.map(async (account) => {
        const businessRepo = new BusinessesRepository(this.userId, account.id);
        const businesses = await businessRepo.list(businessFilters);

        return {
          ...account,
          businesses,
        };
      })
    );

    return accountsWithBusinesses;
  }
}

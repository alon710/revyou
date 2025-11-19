import type { AccountFilters, AccountWithBusinesses, BusinessFilters, Account, AccountCreate } from "@/lib/types";
import { AccountsRepository } from "@/lib/db/repositories";
import { db } from "@/lib/db/client";
import { accounts, businesses, userAccounts } from "@/lib/db/schema";
import { eq, and, inArray, type SQL } from "drizzle-orm";

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

  async createAccount(data: AccountCreate): Promise<Account> {
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
    const accountConditions = [eq(userAccounts.userId, this.userId)];

    if (accountFilters.ids && accountFilters.ids.length > 0) {
      accountConditions.push(inArray(accounts.id, accountFilters.ids));
    }

    const businessConditions: SQL[] = [];

    if (businessFilters.connected !== undefined) {
      businessConditions.push(eq(businesses.connected, businessFilters.connected));
    }

    if (businessFilters.ids && businessFilters.ids.length > 0) {
      businessConditions.push(inArray(businesses.id, businessFilters.ids));
    }

    const accountsWithBusinesses = await db.query.userAccounts.findMany({
      where: and(...accountConditions),
      with: {
        account: {
          with: {
            businesses: {
              where: businessConditions.length > 0 ? and(...businessConditions) : undefined,
            },
          },
        },
      },
    });

    return accountsWithBusinesses.map((ua) => ({
      ...ua.account,
      businesses: ua.account.businesses,
    })) as AccountWithBusinesses[];
  }
}

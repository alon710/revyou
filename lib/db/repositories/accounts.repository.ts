import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { accounts, userAccounts, type Account, type AccountInsert } from "@/lib/db/schema";
import type { AccountFilters } from "@/lib/types";
import { BaseRepository } from "./base.repository";

export class AccountsRepository extends BaseRepository<AccountInsert, Account, Partial<Account>> {
  constructor(private userId: string) {
    super();
  }

  private async verifyAccess(accountId: string): Promise<boolean> {
    const access = await db.query.userAccounts.findFirst({
      where: and(eq(userAccounts.userId, this.userId), eq(userAccounts.accountId, accountId)),
    });
    return !!access;
  }

  async get(accountId: string): Promise<Account | null> {
    if (!(await this.verifyAccess(accountId))) return null;

    const result = await db.query.accounts.findFirst({
      where: eq(accounts.id, accountId),
    });

    return result ?? null;
  }

  async list(filters: AccountFilters = {}): Promise<Account[]> {
    const userAccountsList = await db.query.userAccounts.findMany({
      where: eq(userAccounts.userId, this.userId),
      with: { account: true },
    });

    let accountsList = userAccountsList.map((ua) => ua.account);

    if (filters.email) {
      accountsList = accountsList.filter((a) => a.email === filters.email);
    }

    if (filters.ids && filters.ids.length > 0) {
      const idSet = new Set(filters.ids);
      accountsList = accountsList.filter((a) => idSet.has(a.id));
    }

    return accountsList;
  }

  async create(data: AccountInsert): Promise<Account> {
    return await db.transaction(async (tx) => {
      const [account] = await tx.insert(accounts).values(data).returning();

      await tx.insert(userAccounts).values({
        userId: this.userId,
        accountId: account.id,
        role: "owner",
      });

      return account;
    });
  }

  async update(accountId: string, data: Partial<Account>): Promise<Account> {
    const [updated] = await db.update(accounts).set(data).where(eq(accounts.id, accountId)).returning();

    if (!updated) {
      throw new Error("Account not found");
    }

    return updated;
  }

  async delete(accountId: string): Promise<void> {
    await db.delete(accounts).where(eq(accounts.id, accountId));
  }

  async findByEmail(email: string): Promise<Account | null> {
    const results = await this.list({ email });
    return results.length > 0 ? results[0] : null;
  }

  async updateLastSynced(accountId: string): Promise<Account> {
    return this.update(accountId, {
      lastSynced: new Date(),
    });
  }
}

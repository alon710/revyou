import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { accounts, userAccounts, type Account, type AccountInsert } from "@/lib/db/schema";
import type { AccountFilters } from "@/lib/types";
import { BaseRepository } from "./base.repository";

/**
 * Accounts repository using Drizzle ORM
 * Manages Google Business Profile accounts with user access control
 */
export class AccountsRepository extends BaseRepository<AccountInsert, Account, Partial<Account>> {
  constructor(private userId: string) {
    super();
  }

  /**
   * Get account by ID (with access check)
   */
  async get(accountId: string): Promise<Account | null> {
    const result = await db
      .select()
      .from(accounts)
      .innerJoin(userAccounts, eq(accounts.id, userAccounts.accountId))
      .where(and(eq(accounts.id, accountId), eq(userAccounts.userId, this.userId)))
      .limit(1);

    return result.length > 0 ? result[0].accounts : null;
  }

  /**
   * List all accounts accessible by the user
   */
  async list(filters: AccountFilters = {}): Promise<Account[]> {
    let query = db
      .select({ accounts })
      .from(accounts)
      .innerJoin(userAccounts, eq(accounts.id, userAccounts.accountId))
      .where(eq(userAccounts.userId, this.userId));

    if (filters.email) {
      query = query.where(eq(accounts.email, filters.email));
    }

    if (filters.ids && filters.ids.length > 0) {
      // Filter by IDs in application code since Drizzle's inArray has issues with combined filters
      const results = await query;
      const idSet = new Set(filters.ids);
      return results.filter((r) => idSet.has(r.accounts.id)).map((r) => r.accounts);
    }

    const results = await query;
    return results.map((r) => r.accounts);
  }

  /**
   * Create new account and associate with user
   */
  async create(data: AccountInsert): Promise<Account> {
    return await db.transaction(async (tx) => {
      // Create account
      const [account] = await tx.insert(accounts).values(data).returning();

      // Associate user with account
      await tx.insert(userAccounts).values({
        userId: this.userId,
        accountId: account.id,
        role: "owner",
      });

      return account;
    });
  }

  /**
   * Update account
   */
  async update(accountId: string, data: Partial<Account>): Promise<Account> {
    const [updated] = await db.update(accounts).set(data).where(eq(accounts.id, accountId)).returning();

    if (!updated) {
      throw new Error("Account not found");
    }

    return updated;
  }

  /**
   * Delete account
   */
  async delete(accountId: string): Promise<void> {
    await db.delete(accounts).where(eq(accounts.id, accountId));
  }

  /**
   * Find account by email
   */
  async findByEmail(email: string): Promise<Account | null> {
    const results = await this.list({ email });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Update last synced timestamp
   */
  async updateLastSynced(accountId: string): Promise<Account> {
    return this.update(accountId, {
      lastSynced: new Date(),
    });
  }
}

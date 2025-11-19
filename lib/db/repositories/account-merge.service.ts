import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { userAccounts, accounts } from "@/lib/db/schema";

export class AccountMergeService {
  async mergeUserIntoAccount(userId: string, targetAccountId: string) {
    const existingLink = await db.query.userAccounts.findFirst({
      where: and(eq(userAccounts.userId, userId), eq(userAccounts.accountId, targetAccountId)),
    });

    if (existingLink) {
      return null;
    }

    const [newLink] = await db
      .insert(userAccounts)
      .values({
        userId,
        accountId: targetAccountId,
        role: "member",
        addedAt: new Date(),
      })
      .returning();

    return newLink;
  }

  async hasAccess(userId: string, accountId: string): Promise<boolean> {
    const access = await db.query.userAccounts.findFirst({
      where: and(eq(userAccounts.userId, userId), eq(userAccounts.accountId, accountId)),
    });

    return !!access;
  }

  async cleanupOrphanedAccounts(userId: string, excludeAccountId: string) {
    const userAccountLinks = await db.query.userAccounts.findMany({
      where: eq(userAccounts.userId, userId),
      with: {
        account: {
          with: {
            businesses: true,
            userAccounts: true,
          },
        },
      },
    });

    for (const link of userAccountLinks) {
      if (link.accountId === excludeAccountId) continue;

      const account = link.account;

      if (account.businesses.length === 0 && account.userAccounts.length === 1) {
        await db
          .delete(userAccounts)
          .where(and(eq(userAccounts.userId, userId), eq(userAccounts.accountId, account.id)));

        await db.delete(accounts).where(eq(accounts.id, account.id));
      }
    }
  }
}

export const accountMergeService = new AccountMergeService();

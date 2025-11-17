import type { Subscription, SubscriptionCreate, SubscriptionUpdate } from "@/lib/types/subscription.types";
import type { Business } from "@/lib/types";
import { SubscriptionsRepositoryAdmin } from "@/lib/repositories/subscriptions.repository.admin";
import { AccountsRepositoryAdmin } from "@/lib/repositories/accounts.repository.admin";
import { BusinessesRepositoryAdmin } from "@/lib/repositories/businesses.repository.admin";
import { BaseController } from "./base.controller";
import type { PlanLimits } from "@/lib/subscriptions/plans";

export class SubscriptionsController extends BaseController<SubscriptionCreate, Subscription, SubscriptionUpdate> {
  constructor() {
    const repository = new SubscriptionsRepositoryAdmin();
    super(repository);
  }

  async getUserPlanLimits(userId: string): Promise<PlanLimits> {
    return this.handleError(async () => {
      const repo = this.repository as SubscriptionsRepositoryAdmin;
      return repo.getUserPlanLimits(userId);
    }, "Failed to get user plan limits");
  }

  async checkBusinessLimit(userId: string): Promise<boolean> {
    return this.handleError(async () => {
      const repo = this.repository as SubscriptionsRepositoryAdmin;
      const limits = await repo.getUserPlanLimits(userId);

      // -1 means unlimited
      if (limits.businesses === -1) {
        return true;
      }

      const accountsRepo = new AccountsRepositoryAdmin(userId);
      const accounts = await accountsRepo.list();

      const allBusinesses: Business[] = [];
      for (const account of accounts) {
        const businessRepo = new BusinessesRepositoryAdmin(userId, account.id);
        const businesses = await businessRepo.list();

        const businessesWithAccount = businesses.map((b) => ({
          ...b,
          accountId: account.id,
        }));
        allBusinesses.push(...businessesWithAccount);
      }

      return allBusinesses.length < limits.businesses;
    }, "Failed to check business limit");
  }

  async checkReviewQuota(userId: string): Promise<{ allowed: boolean; currentCount: number; limit: number }> {
    return this.handleError(async () => {
      const repo = this.repository as SubscriptionsRepositoryAdmin;
      const limits = await repo.getUserPlanLimits(userId);
      const currentCount = await repo.countUserReviewsThisMonth(userId);

      // -1 means unlimited
      const allowed = limits.reviewsPerMonth === -1 || currentCount < limits.reviewsPerMonth;

      return {
        allowed,
        currentCount,
        limit: limits.reviewsPerMonth,
      };
    }, "Failed to check review quota");
  }
}

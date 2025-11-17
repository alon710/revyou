import { SubscriptionsRepository, StatsRepository } from "@/lib/db/repositories";
import type { PlanLimits } from "@/lib/subscriptions/plans";

export class SubscriptionsController {
  async getUserPlanLimits(userId: string): Promise<PlanLimits> {
    const repo = new SubscriptionsRepository();
    return repo.getUserPlanLimits(userId);
  }

  async checkBusinessLimit(userId: string): Promise<boolean> {
    const repo = new SubscriptionsRepository();
    const limits = await repo.getUserPlanLimits(userId);

    if (limits.businesses === -1) {
      return true;
    }

    const statsRepo = new StatsRepository();
    const businessCount = await statsRepo.countUserBusinesses(userId);

    return businessCount < limits.businesses;
  }

  async checkReviewQuota(userId: string): Promise<{ allowed: boolean; currentCount: number; limit: number }> {
    const repo = new SubscriptionsRepository();
    const limits = await repo.getUserPlanLimits(userId);
    const currentCount = await repo.countUserReviewsThisMonth(userId);

    const allowed = limits.reviewsPerMonth === -1 || currentCount < limits.reviewsPerMonth;

    return {
      allowed,
      currentCount,
      limit: limits.reviewsPerMonth,
    };
  }
}

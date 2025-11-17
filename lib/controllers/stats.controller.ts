import { StatsRepositoryAdmin } from "@/lib/repositories/stats.repository.admin";
import { SubscriptionsRepositoryAdmin } from "@/lib/repositories/subscriptions.repository.admin";
import type { PlanLimits } from "@/lib/subscriptions/plans";
import { BaseController } from "./base.controller";

interface Stats {}
interface StatsCreate {}
interface StatsUpdate {}

export interface UserStats {
  businesses: number;
  reviews: number;
  businessesPercent: number;
  reviewsPercent: number;
  limits: PlanLimits;
}

export class StatsController extends BaseController<StatsCreate, Stats, StatsUpdate> {
  constructor() {
    const repository = new StatsRepositoryAdmin();
    super(repository);
  }

  async getUserStats(userId: string): Promise<UserStats> {
    return this.handleError(async () => {
      const statsRepo = this.repository as StatsRepositoryAdmin;
      const subRepo = new SubscriptionsRepositoryAdmin();
      const [businesses, reviews, limits] = await Promise.all([
        statsRepo.countUserBusinesses(userId),
        statsRepo.countUserReviewsThisMonth(userId),
        subRepo.getUserPlanLimits(userId),
      ]);

      const businessesPercent = Math.min(100, Math.round((businesses / limits.businesses) * 100));
      const reviewsPercent = Math.min(100, Math.round((reviews / limits.reviewsPerMonth) * 100));

      return {
        businesses,
        reviews,
        businessesPercent,
        reviewsPercent,
        limits,
      };
    }, "Failed to get user stats");
  }
}

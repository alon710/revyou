import { StatsRepository } from "@/lib/db/repositories";
import { SubscriptionsRepository } from "@/lib/db/repositories";
import type { PlanLimits } from "@/lib/subscriptions/plans";

export interface UserStats {
  businesses: number;
  reviews: number;
  businessesPercent: number;
  reviewsPercent: number;
  limits: PlanLimits;
}

export class StatsController {
  async getUserStats(userId: string): Promise<UserStats> {
    const statsRepo = new StatsRepository();
    const subRepo = new SubscriptionsRepository();

    const [businesses, reviews, limits] = await Promise.all([
      statsRepo.countUserBusinesses(userId),
      statsRepo.countUserReviewsThisMonth(userId),
      subRepo.getUserPlanLimits(userId),
    ]);

    const businessesPercent = Math.min(100, Math.round((businesses * 100) / limits.businesses));
    const reviewsPercent = Math.min(100, Math.round((reviews * 100) / limits.reviewsPerMonth));

    return {
      businesses,
      reviews,
      businessesPercent,
      reviewsPercent,
      limits,
    };
  }
}

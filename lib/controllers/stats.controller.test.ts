import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { StatsController } from "./stats.controller";
import { StatsRepository, SubscriptionsRepository } from "@/lib/db/repositories";

vi.mock("@/lib/db/repositories");

type MockStatsRepo = {
  countUserBusinesses: Mock;
  countUserReviewsThisMonth: Mock;
};

type MockSubsRepo = {
  getUserPlanLimits: Mock;
};

describe("StatsController", () => {
  let controller: StatsController;
  let mockStatsRepo: MockStatsRepo;
  let mockSubsRepo: MockSubsRepo;

  beforeEach(() => {
    vi.clearAllMocks();

    mockStatsRepo = {
      countUserBusinesses: vi.fn(),
      countUserReviewsThisMonth: vi.fn(),
    };

    mockSubsRepo = {
      getUserPlanLimits: vi.fn(),
    };

    (StatsRepository as unknown as Mock).mockImplementation(function () {
      return mockStatsRepo;
    });
    (SubscriptionsRepository as unknown as Mock).mockImplementation(function () {
      return mockSubsRepo;
    });

    controller = new StatsController();
  });

  describe("getUserStats", () => {
    it("should return user stats with correct calculations", async () => {
      const userId = "user-123";
      const businessesCount = 5;
      const reviewsCount = 50;
      const limits = {
        businesses: 10,
        reviewsPerMonth: 100,
      };

      mockStatsRepo.countUserBusinesses.mockResolvedValue(businessesCount);
      mockStatsRepo.countUserReviewsThisMonth.mockResolvedValue(reviewsCount);
      mockSubsRepo.getUserPlanLimits.mockResolvedValue(limits);

      const result = await controller.getUserStats(userId);

      expect(mockStatsRepo.countUserBusinesses).toHaveBeenCalledWith(userId);
      expect(mockStatsRepo.countUserReviewsThisMonth).toHaveBeenCalledWith(userId);
      expect(mockSubsRepo.getUserPlanLimits).toHaveBeenCalledWith(userId);

      expect(result).toEqual({
        businesses: businessesCount,
        reviews: reviewsCount,
        businessesPercent: 50,
        reviewsPercent: 50,
        limits,
      });
    });

    it("should cap percentages at 100", async () => {
      const userId = "user-123";
      const businessesCount = 15;
      const reviewsCount = 150;
      const limits = {
        businesses: 10,
        reviewsPerMonth: 100,
      };

      mockStatsRepo.countUserBusinesses.mockResolvedValue(businessesCount);
      mockStatsRepo.countUserReviewsThisMonth.mockResolvedValue(reviewsCount);
      mockSubsRepo.getUserPlanLimits.mockResolvedValue(limits);

      const result = await controller.getUserStats(userId);

      expect(result.businessesPercent).toBe(100);
      expect(result.reviewsPercent).toBe(100);
    });
  });
});

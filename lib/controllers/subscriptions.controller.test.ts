import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsRepository, StatsRepository } from "@/lib/db/repositories";

vi.mock("@/lib/db/repositories");

type MockSubsRepo = {
  getUserPlanLimits: Mock;
  countUserReviewsThisMonth: Mock;
};

type MockStatsRepo = {
  countUserBusinesses: Mock;
};

describe("SubscriptionsController", () => {
  let controller: SubscriptionsController;
  let mockSubsRepo: MockSubsRepo;
  let mockStatsRepo: MockStatsRepo;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSubsRepo = {
      getUserPlanLimits: vi.fn(),
      countUserReviewsThisMonth: vi.fn(),
    };

    mockStatsRepo = {
      countUserBusinesses: vi.fn(),
    };

    (SubscriptionsRepository as unknown as Mock).mockImplementation(function () {
      return mockSubsRepo;
    });
    (StatsRepository as unknown as Mock).mockImplementation(function () {
      return mockStatsRepo;
    });

    controller = new SubscriptionsController();
  });

  describe("getUserPlanLimits", () => {
    it("should return plan limits", async () => {
      const userId = "user-123";
      const limits = { businesses: 5, reviewsPerMonth: 50 };
      mockSubsRepo.getUserPlanLimits.mockResolvedValue(limits);

      const result = await controller.getUserPlanLimits(userId);

      expect(mockSubsRepo.getUserPlanLimits).toHaveBeenCalledWith(userId);
      expect(result).toBe(limits);
    });
  });

  describe("checkBusinessLimit", () => {
    it("should return true if limit is -1 (unlimited)", async () => {
      const userId = "user-123";
      mockSubsRepo.getUserPlanLimits.mockResolvedValue({ businesses: -1 });

      const result = await controller.checkBusinessLimit(userId);

      expect(result).toBe(true);
      expect(mockStatsRepo.countUserBusinesses).not.toHaveBeenCalled();
    });

    it("should return true if count is less than limit", async () => {
      const userId = "user-123";
      mockSubsRepo.getUserPlanLimits.mockResolvedValue({ businesses: 5 });
      mockStatsRepo.countUserBusinesses.mockResolvedValue(4);

      const result = await controller.checkBusinessLimit(userId);

      expect(mockStatsRepo.countUserBusinesses).toHaveBeenCalledWith(userId);
      expect(result).toBe(true);
    });

    it("should return false if count is equal to limit", async () => {
      const userId = "user-123";
      mockSubsRepo.getUserPlanLimits.mockResolvedValue({ businesses: 5 });
      mockStatsRepo.countUserBusinesses.mockResolvedValue(5);

      const result = await controller.checkBusinessLimit(userId);

      expect(result).toBe(false);
    });

    it("should return false if count is greater than limit", async () => {
      const userId = "user-123";
      mockSubsRepo.getUserPlanLimits.mockResolvedValue({ businesses: 5 });
      mockStatsRepo.countUserBusinesses.mockResolvedValue(6);

      const result = await controller.checkBusinessLimit(userId);

      expect(result).toBe(false);
    });
  });

  describe("checkReviewQuota", () => {
    it("should return allowed true if limit is -1 (unlimited)", async () => {
      const userId = "user-123";
      mockSubsRepo.getUserPlanLimits.mockResolvedValue({ reviewsPerMonth: -1 });
      mockSubsRepo.countUserReviewsThisMonth.mockResolvedValue(100);

      const result = await controller.checkReviewQuota(userId);

      expect(result).toEqual({
        allowed: true,
        currentCount: 100,
        limit: -1,
      });
    });

    it("should return allowed true if count is less than limit", async () => {
      const userId = "user-123";
      mockSubsRepo.getUserPlanLimits.mockResolvedValue({ reviewsPerMonth: 50 });
      mockSubsRepo.countUserReviewsThisMonth.mockResolvedValue(49);

      const result = await controller.checkReviewQuota(userId);

      expect(result).toEqual({
        allowed: true,
        currentCount: 49,
        limit: 50,
      });
    });

    it("should return allowed false if count is equal to limit", async () => {
      const userId = "user-123";
      mockSubsRepo.getUserPlanLimits.mockResolvedValue({ reviewsPerMonth: 50 });
      mockSubsRepo.countUserReviewsThisMonth.mockResolvedValue(50);

      const result = await controller.checkReviewQuota(userId);

      expect(result).toEqual({
        allowed: false,
        currentCount: 50,
        limit: 50,
      });
    });
  });
});

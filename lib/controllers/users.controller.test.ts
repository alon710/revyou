import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { UsersController } from "./users.controller";
import { UsersConfigsRepository } from "@/lib/db/repositories";
import { UserConfigMap } from "../db/schema";

vi.mock("@/lib/db/repositories");

type MockRepo = {
  getOrCreate: Mock;
  updateConfigs: Mock;
};

describe("UsersController", () => {
  let controller: UsersController;
  let mockRepo: MockRepo;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepo = {
      getOrCreate: vi.fn(),
      updateConfigs: vi.fn(),
    };

    (UsersConfigsRepository as unknown as Mock).mockImplementation(function () {
      return mockRepo;
    });

    controller = new UsersController();
  });

  describe("getUserConfig", () => {
    it("should get or create user config without locale parameter", async () => {
      const userId = "user-123";
      const mockConfig = { userId, configs: { LOCALE: "en", EMAIL_ON_NEW_REVIEW: true, WEEKLY_SUMMARY_ENABLED: true } };
      mockRepo.getOrCreate.mockResolvedValue(mockConfig);

      const result = await controller.getUserConfig(userId);

      expect(mockRepo.getOrCreate).toHaveBeenCalledWith(userId, undefined);
      expect(result).toBe(mockConfig);
    });

    it("should create user config with detected Hebrew locale", async () => {
      const userId = "user-123";
      const mockConfig = {
        userId,
        configs: { LOCALE: "he", EMAIL_ON_NEW_REVIEW: true, WEEKLY_SUMMARY_ENABLED: true },
      };
      mockRepo.getOrCreate.mockResolvedValue(mockConfig);

      const result = await controller.getUserConfig(userId, "he");

      expect(mockRepo.getOrCreate).toHaveBeenCalledWith(userId, "he");
      expect(result).toBe(mockConfig);
    });

    it("should create user config with detected English locale", async () => {
      const userId = "user-123";
      const mockConfig = {
        userId,
        configs: { LOCALE: "en", EMAIL_ON_NEW_REVIEW: true, WEEKLY_SUMMARY_ENABLED: true },
      };
      mockRepo.getOrCreate.mockResolvedValue(mockConfig);

      const result = await controller.getUserConfig(userId, "en");

      expect(mockRepo.getOrCreate).toHaveBeenCalledWith(userId, "en");
      expect(result).toBe(mockConfig);
    });
  });

  describe("updateUserConfig", () => {
    it("should update user config", async () => {
      const userId = "user-123";
      const data = { locale: "he" as const };
      const mockConfig = { userId, configs: { LOCALE: "he", EMAIL_ON_NEW_REVIEW: true, WEEKLY_SUMMARY_ENABLED: true } };
      mockRepo.updateConfigs.mockResolvedValue(mockConfig);

      const result = await controller.updateUserConfig(userId, data as unknown as Partial<UserConfigMap>);

      expect(mockRepo.updateConfigs).toHaveBeenCalledWith(userId, data);
      expect(result).toBe(mockConfig);
    });
  });
});

import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { BusinessesController } from "./businesses.controller";
import { BusinessesRepository } from "@/lib/db/repositories";
import { ConflictError, ForbiddenError } from "@/lib/api/errors";
import type { BusinessCreate } from "@/lib/types";

vi.mock("@/lib/db/repositories");

type MockRepository = Record<string, Mock>;

describe("BusinessesController", () => {
  const userId = "user-123";
  const accountId = "account-123";
  let controller: BusinessesController;
  let mockBusinessesRepo: MockRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockBusinessesRepo = {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      disconnect: vi.fn(),
      findByGoogleBusinessId: vi.fn(),
      findByGoogleBusinessIdGlobal: vi.fn(),
      findOrCreate: vi.fn(),
    };

    (BusinessesRepository as unknown as Mock).mockImplementation(function () {
      return mockBusinessesRepo;
    });

    controller = new BusinessesController(userId, accountId);
  });

  describe("getBusinesses", () => {
    it("should list businesses using repository", async () => {
      const mockBusinesses = [{ id: "bus-1" }];
      mockBusinessesRepo.list.mockResolvedValue(mockBusinesses);

      const result = await controller.getBusinesses({ ids: ["bus-1"] });

      expect(mockBusinessesRepo.list).toHaveBeenCalledWith({ ids: ["bus-1"] });
      expect(result).toBe(mockBusinesses);
    });
  });

  describe("getBusiness", () => {
    it("should get business by id", async () => {
      const mockBusiness = { id: "bus-1" };
      mockBusinessesRepo.get.mockResolvedValue(mockBusiness);

      const result = await controller.getBusiness("bus-1");

      expect(mockBusinessesRepo.get).toHaveBeenCalledWith("bus-1");
      expect(result).toBe(mockBusiness);
    });

    it("should throw error if business not found", async () => {
      mockBusinessesRepo.get.mockResolvedValue(null);

      await expect(controller.getBusiness("bus-1")).rejects.toThrow("Business not found");
    });
  });

  describe("createBusiness", () => {
    it("should create new business if not exists", async () => {
      const data = { googleBusinessId: "g-1", name: "Test Biz" };
      const mockCreatedBusiness = { id: "bus-1", ...data };

      mockBusinessesRepo.findByGoogleBusinessId.mockResolvedValue(null);
      mockBusinessesRepo.create.mockResolvedValue(mockCreatedBusiness);

      const result = await controller.createBusiness(data as unknown as BusinessCreate);

      expect(mockBusinessesRepo.findByGoogleBusinessId).toHaveBeenCalledWith(data.googleBusinessId);
      expect(mockBusinessesRepo.create).toHaveBeenCalledWith(data);
      expect(result).toBe(mockCreatedBusiness);
    });

    it("should throw ConflictError if business already exists in account", async () => {
      const data = { googleBusinessId: "g-1", name: "Test Biz" };
      mockBusinessesRepo.findByGoogleBusinessId.mockResolvedValue({ id: "bus-1" });

      await expect(controller.createBusiness(data as unknown as BusinessCreate)).rejects.toThrow(ConflictError);
    });
  });

  describe("upsertBusiness", () => {
    it("should find or create if business exists globally", async () => {
      const data = { googleBusinessId: "g-1", name: "Test Biz" };
      mockBusinessesRepo.findByGoogleBusinessIdGlobal.mockResolvedValue({ id: "bus-1" });
      mockBusinessesRepo.findOrCreate.mockResolvedValue({ id: "bus-1" });

      const result = await controller.upsertBusiness(data as unknown as BusinessCreate);

      expect(mockBusinessesRepo.findOrCreate).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: "bus-1" });
    });

    it("should check limit if provided and business does not exist globally", async () => {
      const data = { googleBusinessId: "g-1", name: "Test Biz" };
      mockBusinessesRepo.findByGoogleBusinessIdGlobal.mockResolvedValue(null);
      mockBusinessesRepo.findOrCreate.mockResolvedValue({ id: "bus-1" });
      const checkLimit = vi.fn().mockResolvedValue(true);

      const result = await controller.upsertBusiness(data as unknown as BusinessCreate, checkLimit);

      expect(checkLimit).toHaveBeenCalled();
      expect(mockBusinessesRepo.findOrCreate).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: "bus-1" });
    });

    it("should throw ForbiddenError if limit reached", async () => {
      const data = { googleBusinessId: "g-1", name: "Test Biz" };
      mockBusinessesRepo.findByGoogleBusinessIdGlobal.mockResolvedValue(null);
      const checkLimit = vi.fn().mockResolvedValue(false);

      await expect(controller.upsertBusiness(data as unknown as BusinessCreate, checkLimit)).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe("updateBusiness", () => {
    it("should update business successfully", async () => {
      const businessId = "bus-1";
      const data = { name: "Updated Name" };
      const mockBusiness = { id: businessId };

      mockBusinessesRepo.get.mockResolvedValue(mockBusiness);
      mockBusinessesRepo.update.mockResolvedValue({ ...mockBusiness, ...data });

      const result = await controller.updateBusiness(businessId, data);

      expect(mockBusinessesRepo.get).toHaveBeenCalledWith(businessId);
      expect(mockBusinessesRepo.update).toHaveBeenCalledWith(businessId, data);
      expect(result).toEqual({ ...mockBusiness, ...data });
    });
  });

  describe("deleteBusiness", () => {
    it("should delete business successfully", async () => {
      const businessId = "bus-1";
      const mockBusiness = { id: businessId };

      mockBusinessesRepo.get.mockResolvedValue(mockBusiness);

      await controller.deleteBusiness(businessId);

      expect(mockBusinessesRepo.get).toHaveBeenCalledWith(businessId);
      expect(mockBusinessesRepo.delete).toHaveBeenCalledWith(businessId);
    });
  });

  describe("disconnectBusiness", () => {
    it("should disconnect business successfully", async () => {
      const businessId = "bus-1";
      const mockBusiness = { id: businessId };

      mockBusinessesRepo.get.mockResolvedValue(mockBusiness);
      mockBusinessesRepo.disconnect.mockResolvedValue({ ...mockBusiness, connected: false });

      const result = await controller.disconnectBusiness(businessId);

      expect(mockBusinessesRepo.get).toHaveBeenCalledWith(businessId);
      expect(mockBusinessesRepo.disconnect).toHaveBeenCalledWith(businessId);
      expect(result.connected).toBe(false);
    });
  });

  describe("checkExists", () => {
    it("should return true if business exists", async () => {
      mockBusinessesRepo.findByGoogleBusinessId.mockResolvedValue({ id: "bus-1" });

      const result = await controller.checkExists("g-1");

      expect(result).toBe(true);
    });

    it("should return false if business does not exist", async () => {
      mockBusinessesRepo.findByGoogleBusinessId.mockResolvedValue(null);

      const result = await controller.checkExists("g-1");

      expect(result).toBe(false);
    });
  });

  describe("findByGoogleBusinessId", () => {
    it("should return business if found", async () => {
      const mockBusiness = { id: "bus-1" };
      mockBusinessesRepo.findByGoogleBusinessId.mockResolvedValue(mockBusiness);

      const result = await controller.findByGoogleBusinessId("g-1");

      expect(result).toBe(mockBusiness);
    });
  });
});

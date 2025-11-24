import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { AccountsController } from "./accounts.controller";
import { AccountsRepository } from "@/lib/db/repositories";
import { db } from "@/lib/db/client";
import { AccountCreate, AccountUpdate } from "../types/account.types";

vi.mock("@/lib/db/repositories");
vi.mock("@/lib/db/client", () => ({
  db: {
    query: {
      userAccounts: {
        findMany: vi.fn(),
      },
    },
  },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    eq: vi.fn(),
    and: vi.fn(),
    inArray: vi.fn(),
  };
});

type MockRepository = Record<string, Mock>;

describe("AccountsController", () => {
  const userId = "user-123";
  let controller: AccountsController;
  let mockAccountsRepo: MockRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAccountsRepo = {
      list: vi.fn(),
      get: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateLastSynced: vi.fn(),
    };

    (AccountsRepository as unknown as Mock).mockImplementation(function () {
      return mockAccountsRepo;
    });

    controller = new AccountsController(userId);
  });

  describe("getAccounts", () => {
    it("should list accounts using repository", async () => {
      const mockAccounts = [{ id: "acc-1" }];
      mockAccountsRepo.list.mockResolvedValue(mockAccounts);

      const result = await controller.getAccounts({ ids: ["acc-1"] });

      expect(mockAccountsRepo.list).toHaveBeenCalledWith({ ids: ["acc-1"] });
      expect(result).toBe(mockAccounts);
    });
  });

  describe("getAccount", () => {
    it("should get account by id", async () => {
      const mockAccount = { id: "acc-1" };
      mockAccountsRepo.get.mockResolvedValue(mockAccount);

      const result = await controller.getAccount("acc-1");

      expect(mockAccountsRepo.get).toHaveBeenCalledWith("acc-1");
      expect(result).toBe(mockAccount);
    });

    it("should throw error if account not found", async () => {
      mockAccountsRepo.get.mockResolvedValue(null);

      await expect(controller.getAccount("acc-1")).rejects.toThrow("Account not found");
    });
  });

  describe("createAccount", () => {
    it("should create new account if email does not exist", async () => {
      const data = {
        email: "test@example.com",
        googleRefreshToken: "token",
        googleAccountName: "Test Account",
      };
      const mockCreatedAccount = { id: "acc-1", ...data };

      mockAccountsRepo.findByEmail.mockResolvedValue(null);
      mockAccountsRepo.create.mockResolvedValue(mockCreatedAccount);

      const result = await controller.createAccount(data as AccountCreate);

      expect(mockAccountsRepo.findByEmail).toHaveBeenCalledWith(data.email);
      expect(mockAccountsRepo.create).toHaveBeenCalledWith(data);
      expect(result).toBe(mockCreatedAccount);
    });

    it("should update existing account if email exists", async () => {
      const data = {
        email: "test@example.com",
        googleRefreshToken: "new-token",
        googleAccountName: "New Name",
      };
      const existingAccount = { id: "acc-1", email: "test@example.com" };
      const updatedAccount = { ...existingAccount, ...data };

      mockAccountsRepo.findByEmail.mockResolvedValue(existingAccount);
      mockAccountsRepo.update.mockResolvedValue(updatedAccount);

      const result = await controller.createAccount(data as AccountCreate);

      expect(mockAccountsRepo.findByEmail).toHaveBeenCalledWith(data.email);
      expect(mockAccountsRepo.update).toHaveBeenCalledWith(existingAccount.id, {
        googleRefreshToken: data.googleRefreshToken,
        googleAccountName: data.googleAccountName,
      });
      expect(result).toBe(updatedAccount);
    });
  });

  describe("updateAccount", () => {
    it("should update account successfully", async () => {
      const accountId = "acc-1";
      const data = { name: "Updated Name" };
      const mockAccount = { id: accountId };

      mockAccountsRepo.get.mockResolvedValue(mockAccount);
      mockAccountsRepo.update.mockResolvedValue({ ...mockAccount, ...data });

      const result = await controller.updateAccount(accountId, data as AccountUpdate);

      expect(mockAccountsRepo.get).toHaveBeenCalledWith(accountId);
      expect(mockAccountsRepo.update).toHaveBeenCalledWith(accountId, data);
      expect(result).toEqual({ ...mockAccount, ...data });
    });
  });

  describe("deleteAccount", () => {
    it("should delete account successfully", async () => {
      const accountId = "acc-1";
      const mockAccount = { id: accountId };

      mockAccountsRepo.get.mockResolvedValue(mockAccount);

      await controller.deleteAccount(accountId);

      expect(mockAccountsRepo.get).toHaveBeenCalledWith(accountId);
      expect(mockAccountsRepo.delete).toHaveBeenCalledWith(accountId);
    });
  });

  describe("findByEmail", () => {
    it("should find account by email", async () => {
      const email = "test@example.com";
      const mockAccount = { id: "acc-1", email };

      mockAccountsRepo.findByEmail.mockResolvedValue(mockAccount);

      const result = await controller.findByEmail(email);

      expect(mockAccountsRepo.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBe(mockAccount);
    });
  });

  describe("updateLastSynced", () => {
    it("should update last synced timestamp", async () => {
      const accountId = "acc-1";
      const mockAccount = { id: accountId, lastSyncedAt: new Date() };

      mockAccountsRepo.updateLastSynced.mockResolvedValue(mockAccount);

      const result = await controller.updateLastSynced(accountId);

      expect(mockAccountsRepo.updateLastSynced).toHaveBeenCalledWith(accountId);
      expect(result).toBe(mockAccount);
    });
  });

  describe("updateRefreshToken", () => {
    it("should update refresh token", async () => {
      const accountId = "acc-1";
      const token = "new-token";
      const mockAccount = { id: accountId };

      mockAccountsRepo.get.mockResolvedValue(mockAccount);
      mockAccountsRepo.update.mockResolvedValue({ ...mockAccount, googleRefreshToken: token });

      const result = await controller.updateRefreshToken(accountId, token);

      expect(mockAccountsRepo.update).toHaveBeenCalledWith(accountId, {
        googleRefreshToken: token,
      });
      expect(result.googleRefreshToken).toBe(token);
    });
  });

  describe("getAccountsWithBusinesses", () => {
    it("should return accounts with businesses", async () => {
      const mockUserAccounts = [
        {
          account: {
            id: "acc-1",
            businesses: [{ id: "bus-1" }],
          },
        },
      ];

      (db.query.userAccounts.findMany as Mock).mockResolvedValue(mockUserAccounts);

      const result = await controller.getAccountsWithBusinesses({}, {});

      expect(db.query.userAccounts.findMany).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: "acc-1",
          businesses: [{ id: "bus-1" }],
        },
      ]);
    });

    it("should apply filters correctly", async () => {
      const mockUserAccounts = [
        {
          account: {
            id: "acc-1",
            businesses: [{ id: "bus-1" }],
          },
        },
      ];

      (db.query.userAccounts.findMany as Mock).mockResolvedValue(mockUserAccounts);

      await controller.getAccountsWithBusinesses({ ids: ["acc-1"] }, { connected: true });

      expect(db.query.userAccounts.findMany).toHaveBeenCalled();
    });
  });
});

import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { POST } from "./route.tsx";
import { NextRequest } from "next/server";

import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { BusinessesRepository } from "@/lib/db/repositories/businesses.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { UsersConfigsRepository } from "@/lib/db/repositories/users-configs.repository";
import { ReviewsController } from "@/lib/controllers/reviews.controller";
import { SubscriptionsController } from "@/lib/controllers/subscriptions.controller";
import { createAdminClient } from "@/lib/supabase/admin";

vi.mock("@/lib/db/repositories/reviews.repository");
vi.mock("@/lib/db/repositories/businesses.repository");
vi.mock("@/lib/db/repositories/accounts.repository");
vi.mock("@/lib/db/repositories/users-configs.repository");
vi.mock("@/lib/controllers/reviews.controller");
vi.mock("@/lib/controllers/subscriptions.controller");
vi.mock("@/lib/supabase/admin");

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn(),
    },
  })),
}));
vi.mock("@/lib/emails/review-notification", () => ({
  default: () => null,
}));
vi.mock("@/lib/locale-detection", () => ({
  resolveLocale: vi.fn().mockResolvedValue("en"),
}));

vi.mock("@/lib/db/client", () => ({
  db: {
    query: {
      userAccounts: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    },
  },
}));
vi.mock("@/lib/db/schema", () => ({
  userAccounts: {},
}));

type MockRepository = Record<string, Mock>;
type MockController = Record<string, Mock>;
type MockSupabase = {
  auth: {
    admin: {
      getUserById: Mock;
    };
  };
};

describe("POST /api/internal/process-review", () => {
  let mockReviewsRepo: MockRepository;
  let mockBusinessesRepo: MockRepository;
  let mockAccountsRepo: MockRepository;
  let mockUsersConfigsRepo: MockRepository;
  let mockReviewsController: MockController;
  let mockSubscriptionsController: MockController;
  let mockSupabase: MockSupabase;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReviewsRepo = {
      get: vi.fn(),
      update: vi.fn(),
    };
    mockBusinessesRepo = {
      get: vi.fn(),
    };
    mockAccountsRepo = {
      get: vi.fn(),
    };
    mockUsersConfigsRepo = {
      getOrCreate: vi.fn(),
    };

    (ReviewsRepository as unknown as Mock).mockImplementation(function () {
      return mockReviewsRepo;
    });
    (BusinessesRepository as unknown as Mock).mockImplementation(function () {
      return mockBusinessesRepo;
    });
    (AccountsRepository as unknown as Mock).mockImplementation(function () {
      return mockAccountsRepo;
    });
    (UsersConfigsRepository as unknown as Mock).mockImplementation(function () {
      return mockUsersConfigsRepo;
    });

    mockReviewsController = {
      generateReply: vi.fn(),
      postReply: vi.fn(),
    };
    (ReviewsController as unknown as Mock).mockImplementation(function () {
      return mockReviewsController;
    });

    mockSubscriptionsController = {
      checkReviewQuota: vi.fn(),
    };
    (SubscriptionsController as unknown as Mock).mockImplementation(function () {
      return mockSubscriptionsController;
    });

    mockSupabase = {
      auth: {
        admin: {
          getUserById: vi.fn(),
        },
      },
    };
    (createAdminClient as Mock).mockReturnValue(mockSupabase);
  });

  it("should process review successfully", async () => {
    const req = new NextRequest("http://localhost/api/internal/process-review", {
      method: "POST",
      body: JSON.stringify({
        userId: "user-1",
        accountId: "acc-1",
        businessId: "bus-1",
        reviewId: "rev-1",
      }),
    });

    mockReviewsRepo.get.mockResolvedValue({
      id: "rev-1",
      rating: 5,
      name: "Reviewer",
      text: "Great!",
      businessId: "bus-1",
    });

    mockBusinessesRepo.get.mockResolvedValue({
      id: "bus-1",
      name: "Business",
      starConfigs: {
        5: { autoReply: false },
      },
    });

    mockSubscriptionsController.checkReviewQuota.mockResolvedValue({
      allowed: true,
      currentCount: 10,
      limit: 100,
    });

    mockReviewsController.generateReply.mockResolvedValue({
      aiReply: "AI Reply",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(mockReviewsRepo.get).toHaveBeenCalledWith("rev-1");
    expect(mockBusinessesRepo.get).toHaveBeenCalledWith("bus-1");
    expect(mockReviewsController.generateReply).toHaveBeenCalledWith("rev-1");
    expect(mockReviewsRepo.update).toHaveBeenCalledWith("rev-1", {
      replyStatus: "pending",
    });
    expect(data.replyStatus).toBe("pending");
  });

  it("should fail if quota exceeded", async () => {
    const req = new NextRequest("http://localhost/api/internal/process-review", {
      method: "POST",
      body: JSON.stringify({
        userId: "user-1",
        accountId: "acc-1",
        businessId: "bus-1",
        reviewId: "rev-1",
      }),
    });

    mockReviewsRepo.get.mockResolvedValue({ id: "rev-1", rating: 5 });
    mockBusinessesRepo.get.mockResolvedValue({ id: "bus-1", starConfigs: { 5: {} } });

    mockSubscriptionsController.checkReviewQuota.mockResolvedValue({
      allowed: false,
      currentCount: 100,
      limit: 100,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.quotaExceeded).toBe(true);
    expect(mockReviewsRepo.update).toHaveBeenCalledWith("rev-1", {
      replyStatus: "quota_exceeded",
    });
    expect(mockReviewsController.generateReply).not.toHaveBeenCalled();
  });

  it("should auto-post if enabled", async () => {
    const req = new NextRequest("http://localhost/api/internal/process-review", {
      method: "POST",
      body: JSON.stringify({
        userId: "user-1",
        accountId: "acc-1",
        businessId: "bus-1",
        reviewId: "rev-1",
      }),
    });

    mockReviewsRepo.get.mockResolvedValue({ id: "rev-1", rating: 5, businessId: "bus-1" });
    mockBusinessesRepo.get.mockResolvedValue({
      id: "bus-1",
      starConfigs: { 5: { autoReply: true } },
    });
    mockAccountsRepo.get.mockResolvedValue({
      id: "acc-1",
      googleRefreshToken: "token",
    });
    mockSubscriptionsController.checkReviewQuota.mockResolvedValue({ allowed: true });
    mockReviewsController.generateReply.mockResolvedValue({ aiReply: "AI Reply" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(mockReviewsController.postReply).toHaveBeenCalledWith("rev-1");
    expect(data.replyStatus).toBe("posted");
  });

  it("should handle missing review or business", async () => {
    const req = new NextRequest("http://localhost/api/internal/process-review", {
      method: "POST",
      body: JSON.stringify({
        userId: "user-1",
        accountId: "acc-1",
        businessId: "bus-1",
        reviewId: "rev-1",
      }),
    });

    mockReviewsRepo.get.mockResolvedValue(null);

    const res = await POST(req);
    expect(res.status).toBe(404);
  });
});

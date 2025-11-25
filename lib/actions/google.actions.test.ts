import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { importRecentReviews } from "./google.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { BusinessesRepository } from "@/lib/db/repositories/businesses.repository";
import { listReviews } from "@/lib/google/reviews";
import { decryptToken } from "@/lib/google/business-profile";

vi.mock("@/lib/api/auth");
vi.mock("@/lib/db/repositories/reviews.repository");
vi.mock("@/lib/db/repositories/accounts.repository");
vi.mock("@/lib/db/repositories/businesses.repository");
vi.mock("@/lib/google/reviews");
vi.mock("@/lib/google/business-profile");

global.fetch = vi.fn();

describe("importRecentReviews", () => {
  const userId = "user-123";
  const accountId = "acc-123";
  const businessId = "bus-123";

  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthenticatedUserId as Mock).mockResolvedValue({ userId });

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it("should import reviews with correct quota and status settings", async () => {
    const mockAccount = { googleRefreshToken: "token" };
    const mockBusiness = { googleBusinessId: "loc/123" };
    const mockReviews = [
      {
        reviewId: "g-rev-1",
        reviewer: { displayName: "John Doe" },
        starRating: "FIVE",
        comment: "Great!",
        createTime: "2023-01-01T00:00:00Z",
        updateTime: "2023-01-01T00:00:00Z",
      },
    ];

    (AccountsRepository as unknown as Mock).mockImplementation(function () {
      return { get: vi.fn().mockResolvedValue(mockAccount) };
    });
    (BusinessesRepository as unknown as Mock).mockImplementation(function () {
      return { get: vi.fn().mockResolvedValue(mockBusiness) };
    });

    const mockCreate = vi.fn().mockResolvedValue({ id: "new-rev-1" });
    const mockFindByGoogleReviewId = vi.fn().mockResolvedValue(null);
    const mockList = vi.fn().mockResolvedValue([]);

    (ReviewsRepository as unknown as Mock).mockImplementation(function () {
      return {
        create: mockCreate,
        findByGoogleReviewId: mockFindByGoogleReviewId,
        list: mockList,
      };
    });

    (decryptToken as Mock).mockResolvedValue("decrypted-token");

    (listReviews as Mock).mockImplementation(async function* () {
      yield { reviews: mockReviews };
    });

    await importRecentReviews(userId, accountId, businessId);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        consumesQuota: false,
        replyStatus: "pending",
        isAnonymous: false,
      })
    );

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/internal/process-review"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("new-rev-1"),
      })
    );
  });
});

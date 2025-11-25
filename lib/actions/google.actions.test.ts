import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { importRecentReviews } from "./google.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { BusinessesRepository } from "@/lib/db/repositories/businesses.repository";
import { listReviews } from "@/lib/google/reviews";
import { decryptToken } from "@/lib/google/business-profile";

vi.mock("@/lib/api/auth");
vi.mock("@/lib/db/repositories/reviews.repository", () => ({
  ReviewsRepository: vi.fn(),
}));
vi.mock("@/lib/db/repositories/accounts.repository", () => ({
  AccountsRepository: vi.fn(),
}));
vi.mock("@/lib/db/repositories/businesses.repository", () => ({
  BusinessesRepository: vi.fn(),
}));
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

    vi.mocked(AccountsRepository).mockImplementation(function () {
      return {
        get: vi.fn().mockResolvedValue(mockAccount),
      } as unknown as AccountsRepository;
    });

    vi.mocked(BusinessesRepository).mockImplementation(function () {
      return {
        get: vi.fn().mockResolvedValue(mockBusiness),
      } as unknown as BusinessesRepository;
    });

    const mockCreate = vi.fn().mockResolvedValue({ id: "new-rev-1" });
    const mockFindByGoogleReviewId = vi.fn().mockResolvedValue(null);
    const mockList = vi.fn().mockResolvedValue([]);

    vi.mocked(ReviewsRepository).mockImplementation(function () {
      return {
        create: mockCreate,
        findByGoogleReviewId: mockFindByGoogleReviewId,
        list: mockList,
      } as unknown as ReviewsRepository;
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

  it("should gracefully handle unique constraint violations (code 23505) during review creation", async () => {
    const mockAccount = { googleRefreshToken: "token" };
    const mockBusiness = { googleBusinessId: "loc/123" };
    const mockReviews = [
      {
        reviewId: "duplicate-review-id",
        reviewer: { displayName: "Jane Doe" },
        starRating: "FIVE",
        comment: "Good",
        createTime: "2023-01-01T00:00:00Z",
        updateTime: "2023-01-01T00:00:00Z",
      },
    ];

    vi.mocked(AccountsRepository).mockImplementation(function () {
      return {
        get: vi.fn().mockResolvedValue(mockAccount),
      } as unknown as AccountsRepository;
    });

    vi.mocked(BusinessesRepository).mockImplementation(function () {
      return {
        get: vi.fn().mockResolvedValue(mockBusiness),
      } as unknown as BusinessesRepository;
    });

    const duplicateError = new Error("Duplicate key value violates unique constraint");
    Object.defineProperty(duplicateError, "cause", { value: { code: "23505" } });

    const mockCreate = vi.fn().mockRejectedValue(duplicateError);
    const mockFindByGoogleReviewId = vi.fn().mockResolvedValue(null);
    const mockList = vi.fn().mockResolvedValue([]);

    vi.mocked(ReviewsRepository).mockImplementation(function () {
      return {
        create: mockCreate,
        findByGoogleReviewId: mockFindByGoogleReviewId,
        list: mockList,
      } as unknown as ReviewsRepository;
    });

    (decryptToken as Mock).mockResolvedValue("decrypted-token");

    (listReviews as Mock).mockImplementation(async function* () {
      yield { reviews: mockReviews };
    });

    await expect(importRecentReviews(userId, accountId, businessId)).resolves.not.toThrow();

    expect(mockCreate).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/api/internal/process-review"),
      expect.anything()
    );
  });
});

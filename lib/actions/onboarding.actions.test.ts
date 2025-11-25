import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { triggerReviewImport } from "./onboarding.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { BusinessesRepository } from "@/lib/db/repositories/businesses.repository";
import { ReviewResponsesRepository } from "@/lib/db/repositories/review-responses.repository";
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
vi.mock("@/lib/db/repositories/review-responses.repository", () => ({
  ReviewResponsesRepository: vi.fn(),
}));
vi.mock("@/lib/google/reviews");
vi.mock("@/lib/google/business-profile");

describe("triggerReviewImport", () => {
  const userId = "user-123";
  const accountId = "acc-123";
  const businessId = "bus-123";

  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthenticatedUserId as Mock).mockResolvedValue({ userId });
  });

  it("should gracefully handle unique constraint violations (code 23505)", async () => {
    const mockAccount = { googleRefreshToken: "token" };
    const mockBusiness = { googleBusinessId: "loc/123" };
    const mockReviews = [
      {
        reviewId: "duplicate-review-id",
        reviewer: { displayName: "Jane Doe", isAnonymous: false },
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

    vi.mocked(ReviewsRepository).mockImplementation(function () {
      return {
        create: mockCreate,
        findByGoogleReviewId: mockFindByGoogleReviewId,
      } as unknown as ReviewsRepository;
    });

    vi.mocked(ReviewResponsesRepository).mockImplementation(function () {
      return {
        create: vi.fn(),
      } as unknown as ReviewResponsesRepository;
    });

    (decryptToken as Mock).mockResolvedValue("decrypted-token");

    (listReviews as Mock).mockImplementation(async function* () {
      yield { reviews: mockReviews };
    });

    const result = await triggerReviewImport(accountId, businessId);

    expect(result).toEqual({ success: true, importedCount: 0 });
    expect(mockCreate).toHaveBeenCalled();
  });
});

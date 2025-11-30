import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { ReviewsController } from "./reviews.controller";
import {
  ReviewsRepository,
  ReviewResponsesRepository,
  AccountsRepository,
  BusinessesRepository,
} from "@/lib/db/repositories";
import { generateAIReply } from "@/lib/ai/gemini";
import { postReplyToGoogle } from "@/lib/google/reviews";
import { decryptToken } from "@/lib/google/business-profile";
import { buildReplyPrompt } from "@/lib/ai/prompts/builder";

vi.mock("@/lib/db/repositories");

vi.mock("@/lib/ai/gemini");
vi.mock("@/lib/google/reviews");
vi.mock("@/lib/google/business-profile");
vi.mock("@/lib/ai/prompts/builder");

type MockRepository = Record<string, Mock>;

describe("ReviewsController", () => {
  const userId = "user-123";
  const accountId = "account-123";
  const businessId = "business-123";
  let controller: ReviewsController;

  let mockReviewsRepo: MockRepository;
  let mockResponsesRepo: MockRepository;
  let mockAccountsRepo: MockRepository;
  let mockBusinessesRepo: MockRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReviewsRepo = {
      get: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      markAsPosted: vi.fn(),
      markAsRejected: vi.fn(),
      create: vi.fn(),
      findByGoogleReviewId: vi.fn(),
    };

    mockResponsesRepo = {
      getRecent: vi.fn(),
      getLatestDraft: vi.fn(),
      updateStatus: vi.fn(),
      create: vi.fn(),
    };

    mockAccountsRepo = {
      get: vi.fn(),
    };

    mockBusinessesRepo = {
      get: vi.fn(),
    };

    (ReviewsRepository as unknown as Mock).mockImplementation(function () {
      return mockReviewsRepo;
    });
    (ReviewResponsesRepository as unknown as Mock).mockImplementation(function () {
      return mockResponsesRepo;
    });
    (AccountsRepository as unknown as Mock).mockImplementation(function () {
      return mockAccountsRepo;
    });
    (BusinessesRepository as unknown as Mock).mockImplementation(function () {
      return mockBusinessesRepo;
    });

    controller = new ReviewsController(userId, accountId, businessId);
  });

  describe("generateReply", () => {
    it("should generate an AI reply successfully", async () => {
      const reviewId = "review-1";
      const mockReview = { id: reviewId, businessId, text: "Great service!" };
      const mockBusiness = { id: businessId, name: "Test Business" };
      const mockPrompt = "Generated Prompt";
      const mockAiReply = "Thank you for your feedback!";

      mockReviewsRepo.get.mockResolvedValue(mockReview);
      mockBusinessesRepo.get.mockResolvedValue(mockBusiness);
      mockResponsesRepo.getRecent.mockResolvedValue([]);
      mockResponsesRepo.getLatestDraft.mockResolvedValue(null);
      (buildReplyPrompt as Mock).mockReturnValue(mockPrompt);
      (generateAIReply as Mock).mockResolvedValue(mockAiReply);

      const result = await controller.generateReply(reviewId);

      expect(mockReviewsRepo.get).toHaveBeenCalledWith(reviewId);
      expect(mockBusinessesRepo.get).toHaveBeenCalledWith(businessId);
      expect(buildReplyPrompt).toHaveBeenCalled();
      expect(generateAIReply).toHaveBeenCalledWith(mockPrompt);
      expect(mockResponsesRepo.create).toHaveBeenCalledWith({
        reviewId,
        text: mockAiReply,
        status: "draft",
        generatedBy: null,
        type: "ai_generated",
      });
      expect(result.aiReply).toBe(mockAiReply);
    });

    it("should throw error if business not found", async () => {
      const reviewId = "review-1";
      mockReviewsRepo.get.mockResolvedValue({ id: reviewId, businessId });
      mockBusinessesRepo.get.mockResolvedValue(null);

      await expect(controller.generateReply(reviewId)).rejects.toThrow("Business not found");
    });

    it("should update previous draft status to rejected if exists", async () => {
      const reviewId = "review-1";
      const mockReview = { id: reviewId, businessId };
      const mockBusiness = { id: businessId };
      const mockOldDraft = { id: "draft-1", text: "Old draft" };

      mockReviewsRepo.get.mockResolvedValue(mockReview);
      mockBusinessesRepo.get.mockResolvedValue(mockBusiness);
      mockResponsesRepo.getRecent.mockResolvedValue([]);
      mockResponsesRepo.getLatestDraft.mockResolvedValue(mockOldDraft);
      (generateAIReply as Mock).mockResolvedValue("New reply");

      await controller.generateReply(reviewId);

      expect(mockResponsesRepo.updateStatus).toHaveBeenCalledWith("draft-1", "rejected");
    });
  });

  describe("postReply", () => {
    it("should post reply to Google successfully", async () => {
      const reviewId = "review-1";
      const customReply = "My custom reply";
      const mockReview = {
        id: reviewId,
        businessId,
        googleReviewName: "accounts/1/locations/2/reviews/3",
      };
      const mockBusiness = {
        id: businessId,
        accountId,
      };
      const mockAccount = {
        id: accountId,
        googleRefreshToken: "encrypted-token",
      };
      const mockDecryptedToken = "decrypted-token";

      mockReviewsRepo.get.mockResolvedValue(mockReview);
      mockResponsesRepo.getLatestDraft.mockResolvedValue(null);
      mockBusinessesRepo.get.mockResolvedValue(mockBusiness);
      mockAccountsRepo.get.mockResolvedValue(mockAccount);
      (decryptToken as Mock).mockResolvedValue(mockDecryptedToken);
      (postReplyToGoogle as Mock).mockResolvedValue({ comment: customReply });

      process.env.GOOGLE_CLIENT_ID = "client-id";
      process.env.GOOGLE_CLIENT_SECRET = "client-secret";

      const result = await controller.postReply(reviewId, customReply, userId);

      expect(mockReviewsRepo.get).toHaveBeenCalledWith(reviewId);
      expect(mockBusinessesRepo.get).toHaveBeenCalledWith(businessId);
      expect(mockAccountsRepo.get).toHaveBeenCalledWith(accountId);
      expect(decryptToken).toHaveBeenCalledWith("encrypted-token");
      expect(postReplyToGoogle).toHaveBeenCalledWith(
        mockReview.googleReviewName,
        customReply,
        mockDecryptedToken,
        "client-id",
        "client-secret"
      );
      expect(mockReviewsRepo.markAsPosted).toHaveBeenCalledWith(reviewId);
      expect(mockResponsesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          reviewId,
          text: customReply,
          status: "posted",
          postedBy: userId,
        })
      );
      expect(result.replyPosted).toBe(customReply);
    });

    it("should use latest draft if no custom reply provided", async () => {
      const reviewId = "review-1";
      const mockDraft = { text: "Draft reply" };
      const mockReview = {
        id: reviewId,
        businessId,
        googleReviewName: "name",
      };
      const mockBusiness = {
        id: businessId,
        accountId,
      };
      const mockAccount = { googleRefreshToken: "token" };

      mockReviewsRepo.get.mockResolvedValue(mockReview);
      mockResponsesRepo.getLatestDraft.mockResolvedValue(mockDraft);
      mockBusinessesRepo.get.mockResolvedValue(mockBusiness);
      mockAccountsRepo.get.mockResolvedValue(mockAccount);
      (decryptToken as Mock).mockResolvedValue("decrypted");

      await controller.postReply(reviewId);

      expect(postReplyToGoogle).toHaveBeenCalledWith(
        expect.anything(),
        mockDraft.text,
        expect.anything(),
        expect.anything(),
        expect.anything()
      );
    });

    it("should throw error if no reply to post", async () => {
      mockReviewsRepo.get.mockResolvedValue({ id: "1" });
      mockResponsesRepo.getLatestDraft.mockResolvedValue(null);

      await expect(controller.postReply("1")).rejects.toThrow("No reply to post");
    });
  });

  describe("saveDraft", () => {
    it("should save a new draft", async () => {
      const reviewId = "review-1";
      const customReply = "Draft reply";
      const mockReview = { id: reviewId };

      mockReviewsRepo.get.mockResolvedValue(mockReview);
      mockResponsesRepo.getLatestDraft.mockResolvedValue(null);

      await controller.saveDraft(reviewId, customReply);

      expect(mockResponsesRepo.create).toHaveBeenCalledWith({
        reviewId,
        text: customReply,
        status: "draft",
        generatedBy: userId,
        type: "human_generated",
      });
    });

    it("should reject previous draft when saving new one", async () => {
      const reviewId = "review-1";
      const customReply = "New draft";
      const mockReview = { id: reviewId };
      const mockOldDraft = { id: "draft-1", text: "Old draft", status: "draft" };

      mockReviewsRepo.get.mockResolvedValue(mockReview);
      mockResponsesRepo.getLatestDraft.mockResolvedValue(mockOldDraft);

      await controller.saveDraft(reviewId, customReply);

      expect(mockResponsesRepo.updateStatus).toHaveBeenCalledWith("draft-1", "rejected");
      expect(mockResponsesRepo.create).toHaveBeenCalled();
    });
  });
});

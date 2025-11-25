import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { SubscriptionsRepository } from "./subscriptions.repository";
import { db } from "@/lib/db/client";

vi.mock("@/lib/db/client", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
}));

describe("SubscriptionsRepository", () => {
  let repository: SubscriptionsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SubscriptionsRepository();
  });

  describe("countUserReviewsThisMonth", () => {
    it("should return 0 if query fails", async () => {
      (db.select as Mock).mockImplementation(() => {
        throw new Error("DB Error");
      });

      const count = await repository.countUserReviewsThisMonth("user-1");
      expect(count).toBe(0);
    });

    it("should correctly count quota-consuming reviews", async () => {
      const mockResult = [{ count: 5 }];

      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(mockResult),
            }),
          }),
        }),
      });

      const count = await repository.countUserReviewsThisMonth("user-1");

      expect(db.select).toHaveBeenCalled();
      expect(count).toBe(5);
    });

    it("should return 0 if no result found", async () => {
      const mockResult: { count: number }[] = [];

      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(mockResult),
            }),
          }),
        }),
      });

      const count = await repository.countUserReviewsThisMonth("user-1");
      expect(count).toBe(0);
    });
  });
});

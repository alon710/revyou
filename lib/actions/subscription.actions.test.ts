import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { createCheckoutSession } from "./subscription.actions";
import { getStripe, getStripePriceId } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";
import { resolveLocale } from "@/lib/locale-detection";

vi.mock("@/lib/stripe/config");
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/locale-detection");

describe("createCheckoutSession", () => {
  const mockStripe = {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  };

  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getStripe as unknown as Mock).mockReturnValue(mockStripe);
    (createClient as unknown as Mock).mockResolvedValue(mockSupabase);
    (getStripePriceId as unknown as Mock).mockReturnValue("price_123");
    (resolveLocale as unknown as Mock).mockResolvedValue("en");
  });

  it("should create a checkout session successfully", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user_123", email: "test@example.com" } },
      error: null,
    });
    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/test",
    });

    const result = await createCheckoutSession("pro", "monthly");

    expect(result).toEqual({ url: "https://checkout.stripe.com/test" });
    expect(getStripePriceId).toHaveBeenCalledWith("pro", "monthly");
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: "test@example.com",
        client_reference_id: "user_123",
        line_items: [{ price: "price_123", quantity: 1 }],
      })
    );
  });

  it("should return error if user is not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error("Auth error"),
    });

    const result = await createCheckoutSession("pro", "monthly");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("should return error for invalid plan", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user_123" } },
      error: null,
    });

    const result = await createCheckoutSession("invalid", "monthly");
    expect(result).toEqual({ error: "Invalid plan" });
  });

  it("should return error for invalid interval", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user_123" } },
      error: null,
    });

    const result = await createCheckoutSession("pro", "invalid");
    expect(result).toEqual({ error: "Invalid interval" });
  });
});

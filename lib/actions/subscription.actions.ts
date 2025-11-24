"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { SubscriptionsRepository } from "@/lib/db/repositories";
import type { Subscription } from "@/lib/db/schema";
import { getStripe, getStripePriceId } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";
import { resolveLocale } from "@/lib/locale-detection";

export async function getActiveSubscription(): Promise<Subscription | null> {
  try {
    const { userId } = await getAuthenticatedUserId();
    const repo = new SubscriptionsRepository();
    return repo.getActiveSubscriptionForUser(userId);
  } catch (error) {
    console.error("Error getting active subscription:", error);
    return null;
  }
}

export async function cancelSubscription(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await getAuthenticatedUserId();

    const repo = new SubscriptionsRepository();
    await repo.cancel(userId);

    return { success: true };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createCheckoutSession(
  plan: "basic" | "pro",
  interval: "monthly" | "yearly"
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { error: "Unauthorized" };
    }

    if (!plan || !interval) {
      return { error: "Missing plan or interval" };
    }

    if (!["basic", "pro"].includes(plan)) {
      return { error: "Invalid plan" };
    }

    if (!["monthly", "yearly"].includes(interval)) {
      return { error: "Invalid interval" };
    }

    const priceId = getStripePriceId(plan, interval);
    const locale = await resolveLocale({ userId: user.id });

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/pricing`,
      customer_email: user.email,
      client_reference_id: user.id,
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
        planTier: plan,
        interval: interval,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planTier: plan,
          interval: interval,
        },
      },
    });

    if (!session.url) {
      return { error: "Failed to create checkout session" };
    }

    return { url: session.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { error: "Failed to create checkout session" };
  }
}

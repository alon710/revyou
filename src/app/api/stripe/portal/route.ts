import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";
import { SubscriptionsRepository } from "@/lib/db/repositories/subscriptions.repository";
import { resolveLocale } from "@/lib/locale-detection";

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionsRepo = new SubscriptionsRepository();
    const subscription = await subscriptionsRepo.getByUserId(user.id);

    if (!subscription?.stripeCustomerId || subscription.status !== "active") {
      return NextResponse.json(
        { error: "Billing portal is only available for active paid subscriptions" },
        { status: 403 }
      );
    }

    const locale = await resolveLocale();

    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard/subscription`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}

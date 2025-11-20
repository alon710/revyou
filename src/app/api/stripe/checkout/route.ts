import { NextRequest, NextResponse } from "next/server";
import { getStripe, getStripePriceId } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";
import { getLocaleFromRequest } from "@/lib/api/auth";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, interval } = body as {
      plan: "basic" | "pro";
      interval: "monthly" | "yearly";
    };

    if (!plan || !interval) {
      return NextResponse.json({ error: "Missing plan or interval" }, { status: 400 });
    }

    if (!["basic", "pro"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!["monthly", "yearly"].includes(interval)) {
      return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
    }

    const priceId = getStripePriceId(plan, interval);

    const locale = getLocaleFromRequest(req);

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
      metadata: {
        userId: user.id,
        planTier: plan,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planTier: plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

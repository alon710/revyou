import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, getPlanTierFromPriceId } from "@/lib/stripe/config";
import { SubscriptionsRepository } from "@/lib/db/repositories/subscriptions.repository";

export const runtime = "nodejs";

interface InvoiceWithSubscription extends Stripe.Invoice {
  subscription?: string | Stripe.Subscription | null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const subscriptionsRepo = new SubscriptionsRepository();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.userId || session.client_reference_id;
        if (!userId) {
          console.error("No userId found in checkout session");
          return NextResponse.json({ error: "Missing userId in checkout session" }, { status: 400 });
        }

        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (!subscriptionId) {
          console.error("No subscription ID found in checkout session");
          return NextResponse.json({ error: "Missing subscription ID in checkout session" }, { status: 400 });
        }

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);

        let priceId: string | undefined;
        let planTier: string;

        if (subscription.items?.data?.length > 0) {
          priceId = subscription.items.data[0].price.id;
          planTier = getPlanTierFromPriceId(priceId);
        } else {
          console.warn("No subscription items found for checkout session, defaulting to free tier");
          priceId = undefined;
          planTier = "free";
        }

        const existingSubscription = await subscriptionsRepo.getByUserId(userId);

        if (existingSubscription) {
          await subscriptionsRepo.update(existingSubscription.id, {
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            planTier,
            status: subscription.status,
          });
        } else {
          await subscriptionsRepo.create({
            userId,
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            planTier,
            status: subscription.status,
          });
        }

        console.log(`Subscription created for user ${userId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error("No userId found in subscription metadata");
          return NextResponse.json({ error: "Missing userId in subscription metadata" }, { status: 400 });
        }

        let priceId: string | undefined;
        let planTier: string;

        if (subscription.items?.data?.length > 0) {
          priceId = subscription.items.data[0].price.id;
          planTier = getPlanTierFromPriceId(priceId);
        } else {
          console.warn("No subscription items found for subscription update, defaulting to free tier");
          priceId = undefined;
          planTier = "free";
        }

        const existingSubscription = await subscriptionsRepo.getByUserId(userId);

        if (existingSubscription) {
          await subscriptionsRepo.update(existingSubscription.id, {
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            planTier,
            status: subscription.status,
          });
          console.log(
            `Subscription updated for user ${userId}: plan=${planTier}, status=${subscription.status}, subscriptionId=${subscription.id}`
          );
        } else {
          await subscriptionsRepo.create({
            userId,
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            planTier,
            status: subscription.status,
          });
          console.log(
            `Subscription created for user ${userId}: plan=${planTier}, status=${subscription.status}, subscriptionId=${subscription.id}`
          );
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error("No userId found in subscription metadata");
          return NextResponse.json({ error: "Missing userId in subscription metadata" }, { status: 400 });
        }

        const existingSubscription = await subscriptionsRepo.getByUserId(userId);
        if (existingSubscription) {
          await subscriptionsRepo.update(existingSubscription.id, {
            planTier: "free",
            status: "canceled",
            stripeSubscriptionId: null,
            stripePriceId: null,
          });
          console.log(`Subscription canceled for user ${userId}`);
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as InvoiceWithSubscription;
        const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : null;

        if (subscriptionId) {
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.userId;

          if (userId) {
            const existingSubscription = await subscriptionsRepo.getByUserId(userId);
            if (existingSubscription) {
              await subscriptionsRepo.update(existingSubscription.id, {
                status: "active",
              });
              console.log(`Payment succeeded for user ${userId}`);
            }
          }
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as InvoiceWithSubscription;
        const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : null;

        if (subscriptionId) {
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.userId;

          if (userId) {
            const existingSubscription = await subscriptionsRepo.getByUserId(userId);
            if (existingSubscription) {
              await subscriptionsRepo.update(existingSubscription.id, {
                status: "past_due",
              });
              console.log(`Payment failed for user ${userId}`);
            }
          }
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

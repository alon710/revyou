import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import Stripe from "stripe";

interface PortalSessionRequest {
  returnUrl?: string;
}

/**
 * Cloud Function to create a Stripe Customer Portal session
 * The Stripe extension doesn't provide this functionality, so we need to create it
 */
export const createPortalSession = onCall<PortalSessionRequest>(
  async (request) => {
    // Check authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Must be signed in to create a portal session"
      );
    }

    const userId = request.auth.uid;
    const returnUrl =
      request.data.returnUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/settings`;

    try {
      // Initialize Stripe inside the function (lazy load)
      // This prevents "Neither apiKey nor config.authenticator provided" error during build
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

      if (!stripeSecretKey) {
        throw new HttpsError(
          "failed-precondition",
          "Stripe secret key not configured"
        );
      }

      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2025-09-30.clover",
      });

      const db = admin.firestore();
      const customerDoc = await db.collection("users").doc(userId).get();

      if (!customerDoc.exists) {
        throw new HttpsError(
          "not-found",
          "No Stripe customer found. Please create a subscription first."
        );
      }

      const stripeId = customerDoc.data()?.stripeId;

      if (!stripeId) {
        throw new HttpsError(
          "not-found",
          "Stripe customer ID not found in customer document"
        );
      }

      // Create a Stripe Customer Portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: stripeId,
        return_url: returnUrl,
      });

      return { url: session.url };
    } catch (error) {
      console.error("Error creating portal session:", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to create portal session");
    }
  }
);

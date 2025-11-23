import { OAuth2Client } from "google-auth-library";

export async function verifyPubSubToken(
  authHeader: string | null,
  expectedAudience: string
): Promise<{ valid: boolean; email?: string; error?: string }> {
  console.log("🔐 Starting Pub/Sub token verification");
  console.log("Expected audience:", expectedAudience);
  console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);

  if (process.env.SKIP_PUBSUB_VERIFICATION === "true" || process.env.NODE_ENV === "development") {
    console.warn("⚠️ Skipping Pub/Sub token verification (SKIP_PUBSUB_VERIFICATION=true or NODE_ENV=development)");
    return { valid: true, email: "skipped-verification@example.com" };
  }

  if (!authHeader) {
    return { valid: false, error: "Missing Authorization header" };
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return { valid: false, error: "Invalid Authorization header format. Expected: Bearer <token>" };
  }

  const token = parts[1];

  try {
    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: expectedAudience,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return { valid: false, error: "Token payload is empty" };
    }

    console.log("✅ Token verified successfully");
    console.log("Token audience (aud):", payload.aud);
    console.log("Token issuer (iss):", payload.iss);
    console.log("Token email:", payload.email);

    const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
    if (!validIssuers.includes(payload.iss)) {
      return { valid: false, error: `Invalid issuer: ${payload.iss}` };
    }

    if (!payload.email) {
      return { valid: false, error: "Token missing email claim" };
    }

    if (!payload.email.endsWith(".gserviceaccount.com")) {
      return { valid: false, error: `Email is not a Google service account: ${payload.email}` };
    }

    return { valid: true, email: payload.email };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Token verification error details:");
    console.error("Error message:", errorMessage);
    console.error("Expected audience:", expectedAudience);
    console.error("NEXT_PUBLIC_APP_URL from env:", process.env.NEXT_PUBLIC_APP_URL);

    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payloadBase64 = parts[1];
        const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
        const payload = JSON.parse(payloadJson);
        console.error("Token's actual audience claim (aud):", payload.aud);
        console.error("Token's issuer (iss):", payload.iss);
        console.error("Token's email:", payload.email);
      }
    } catch (decodeError) {
      console.error("Could not decode token to inspect claims:", decodeError);
    }

    return { valid: false, error: `Token verification failed: ${errorMessage}` };
  }
}

export function getPubSubWebhookAudience(): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/google-reviews`;
}

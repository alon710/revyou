import { OAuth2Client } from "google-auth-library";

export async function verifyPubSubToken(
  authHeader: string | null,
  expectedAudience: string
): Promise<{ valid: boolean; email?: string; error?: string }> {
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

    const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
    if (!validIssuers.includes(payload.iss)) {
      return { valid: false, error: `Invalid issuer: ${payload.iss}` };
    }

    if (!payload.email) {
      return { valid: false, error: "Token missing email claim" };
    }

    if (!payload.email.endsWith("@gserviceaccount.com")) {
      return { valid: false, error: `Email is not a Google service account: ${payload.email}` };
    }

    return { valid: true, email: payload.email };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { valid: false, error: `Token verification failed: ${errorMessage}` };
  }
}

export function getPubSubWebhookAudience(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bottie.ai";
  return `${baseUrl}/api/webhooks/google-reviews`;
}

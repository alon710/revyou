import { OAuth2Client } from "google-auth-library";

const GOOGLE_BUSINESS_SCOPES = [
  "https://www.googleapis.com/auth/business.manage",
];

function createOAuthClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

export function getAuthorizationUrl(state?: string): string {
  const oauth2Client = createOAuthClient();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: GOOGLE_BUSINESS_SCOPES,
    state: state || "",
    prompt: "consent",
  });

  return authUrl;
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = createOAuthClient();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    throw new Error("Failed to exchange authorization code");
  }
}

export function encryptToken(token: string): string {
  return Buffer.from(token).toString("base64");
}

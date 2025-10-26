import { OAuth2Client } from "google-auth-library";

export const GOOGLE_BUSINESS_SCOPES = [
  "https://www.googleapis.com/auth/business.manage",
];

export function createOAuthClient(): OAuth2Client {
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

export async function refreshAccessToken(
  refreshToken: string
): Promise<string> {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    if (!credentials.access_token) {
      throw new Error("No access token returned");
    }
    return credentials.access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw new Error("לא ניתן לרענן את האסימון. נא להתחבר מחדש.");
  }
}

export async function getAuthenticatedClient(
  refreshToken: string
): Promise<OAuth2Client> {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    await oauth2Client.refreshAccessToken();
    return oauth2Client;
  } catch (error) {
    console.error("Error getting authenticated client:", error);
    throw new Error("לא ניתן לאמת את הלקוח. נא להתחבר מחדש.");
  }
}

export async function revokeToken(refreshToken: string): Promise<void> {
  const oauth2Client = createOAuthClient();

  try {
    await oauth2Client.revokeToken(refreshToken);
  } catch (error) {
    console.error("Error revoking token:", error);
  }
}

export function encryptToken(token: string): string {
  return Buffer.from(token).toString("base64");
}

export function decryptToken(encryptedToken: string): string {
  return Buffer.from(encryptedToken, "base64").toString("utf-8");
}

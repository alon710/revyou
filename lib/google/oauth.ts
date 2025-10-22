import { OAuth2Client } from "google-auth-library";

/**
 * Google OAuth 2.0 Configuration for Business Profile API
 */

// Scopes required for Google Business Profile API
export const GOOGLE_BUSINESS_SCOPES = [
  "https://www.googleapis.com/auth/business.manage",
];

/**
 * Create OAuth2Client instance
 * @returns OAuth2Client configured with credentials
 */
export function createOAuthClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

/**
 * Generate authorization URL for Google OAuth
 * @param state - State parameter for CSRF protection
 * @returns Authorization URL
 */
export function getAuthorizationUrl(state?: string): string {
  const oauth2Client = createOAuthClient();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // Request refresh token
    scope: GOOGLE_BUSINESS_SCOPES,
    state: state || "",
    prompt: "consent", // Force consent screen to get refresh token
  });

  return authUrl;
}

/**
 * Exchange authorization code for tokens
 * @param code - Authorization code from callback
 * @returns Tokens object with access_token and refresh_token
 */
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

/**
 * Refresh access token using refresh token
 * @param refreshToken - Stored refresh token
 * @returns New access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
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

/**
 * Get authenticated OAuth2Client with refresh token
 * @param refreshToken - Stored refresh token
 * @returns Authenticated OAuth2Client
 */
export async function getAuthenticatedClient(
  refreshToken: string
): Promise<OAuth2Client> {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    // Refresh the access token
    await oauth2Client.refreshAccessToken();
    return oauth2Client;
  } catch (error) {
    console.error("Error getting authenticated client:", error);
    throw new Error("לא ניתן לאמת את הלקוח. נא להתחבר מחדש.");
  }
}

/**
 * Revoke refresh token (disconnect)
 * @param refreshToken - Refresh token to revoke
 */
export async function revokeToken(refreshToken: string): Promise<void> {
  const oauth2Client = createOAuthClient();

  try {
    await oauth2Client.revokeToken(refreshToken);
  } catch (error) {
    console.error("Error revoking token:", error);
    // Don't throw - token might already be invalid
  }
}

/**
 * Simple encryption for storing refresh token
 * NOTE: In production, use proper encryption (e.g., crypto library)
 * @param token - Token to encrypt
 * @returns Encrypted token
 */
export function encryptToken(token: string): string {
  // TODO: Implement proper encryption in production
  // For now, we'll use base64 encoding as a placeholder
  return Buffer.from(token).toString("base64");
}

/**
 * Simple decryption for refresh token
 * @param encryptedToken - Encrypted token
 * @returns Decrypted token
 */
export function decryptToken(encryptedToken: string): string {
  // TODO: Implement proper decryption in production
  return Buffer.from(encryptedToken, "base64").toString("utf-8");
}

import { OAuth2Client } from "google-auth-library";
import * as Iron from "@hapi/iron";

const GOOGLE_BUSINESS_PROFILE_API_SCOPES = [
  "https://www.googleapis.com/auth/business.manage",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
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
    scope: GOOGLE_BUSINESS_PROFILE_API_SCOPES,
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

export async function encryptToken(token: string): Promise<string> {
  const secret = process.env.TOKEN_ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error("TOKEN_ENCRYPTION_SECRET not configured");
  }

  try {
    return await Iron.seal(token, secret, Iron.defaults);
  } catch (error) {
    console.error("Error encrypting token:", error);
    throw new Error("Failed to encrypt token");
  }
}

export async function decryptToken(encryptedToken: string): Promise<string> {
  const secret = process.env.TOKEN_ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error("TOKEN_ENCRYPTION_SECRET not configured");
  }

  try {
    return await Iron.unseal(encryptedToken, secret, Iron.defaults);
  } catch (error) {
    console.error("Error decrypting token:", error);
    throw new Error("Failed to decrypt token");
  }
}

export async function revokeGoogleRefreshToken(
  encryptedToken: string
): Promise<void> {
  try {
    // Decrypt the token first
    const refreshToken = await decryptToken(encryptedToken);

    // Create OAuth client
    const oauth2Client = createOAuthClient();

    // Revoke the token with Google
    await oauth2Client.revokeToken(refreshToken);

    console.log("Successfully revoked Google OAuth refresh token");
  } catch (error) {
    console.error("Error revoking Google OAuth token:", error);
    // Don't throw - we want deletion to proceed even if revocation fails
    // (token may already be invalid/revoked)
  }
}

export async function getUserInfo(accessToken: string): Promise<{
  email: string;
  name: string;
}> {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user info from Google");
    }

    const data = await response.json();
    return {
      email: data.email,
      name: data.name || data.email,
    };
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw new Error("Failed to get Google account information");
  }
}

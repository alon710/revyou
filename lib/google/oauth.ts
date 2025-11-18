import { OAuth2Client } from "google-auth-library";
import * as Iron from "@hapi/iron";
import { env } from "@/lib/env";

const GOOGLE_BUSINESS_PROFILE_API_SCOPES = [
  "https://www.googleapis.com/auth/business.manage",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

function createOAuthClient(): OAuth2Client {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${env.NEXT_PUBLIC_APP_URL}/api/google/callback`;

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

export function getAuthorizationUrl(state?: string, loginHint?: string): string {
  const oauth2Client = createOAuthClient();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: GOOGLE_BUSINESS_PROFILE_API_SCOPES,
    state: state || "",
    prompt: "consent",
    ...(loginHint && { login_hint: loginHint }),
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
  const secret = env.TOKEN_ENCRYPTION_SECRET;

  try {
    return await Iron.seal(token, secret, Iron.defaults);
  } catch (error) {
    console.error("Error encrypting token:", error);
    throw new Error("Failed to encrypt token");
  }
}

export async function getUserInfo(accessToken: string): Promise<{
  email: string;
  name: string;
}> {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

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

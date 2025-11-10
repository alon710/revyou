import { OAuth2Client } from "google-auth-library";
import * as Iron from "@hapi/iron";

interface ErrorResponse {
  message?: string;
  code?: string;
  status?: number;
  response?:
    | {
        data?: unknown;
      }
    | unknown;
}

const GOOGLE_BUSINESS_PROFILE_API_SCOPES = [
  "https://www.googleapis.com/auth/business.manage",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

function createOAuthClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`;

  console.error("[OAuth Debug] Creating OAuth client:");
  console.error(`[OAuth Debug] Client ID (first 20 chars): ${clientId?.substring(0, 20) || "MISSING"}`);
  console.error(`[OAuth Debug] Client Secret exists: ${!!clientSecret}`);
  console.error(`[OAuth Debug] Redirect URI: ${redirectUri}`);
  console.error(`[OAuth Debug] NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`);

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

export function getAuthorizationUrl(state?: string, loginHint?: string): string {
  console.error("[OAuth Debug] Generating authorization URL");
  console.error(`[OAuth Debug] State: ${state?.substring(0, 20) || "none"}...`);
  console.error(`[OAuth Debug] Login hint: ${loginHint || "none"}`);

  const oauth2Client = createOAuthClient();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: GOOGLE_BUSINESS_PROFILE_API_SCOPES,
    state: state || "",
    prompt: "consent",
    ...(loginHint && { login_hint: loginHint }),
  });

  console.error(`[OAuth Debug] Generated auth URL (first 100 chars): ${authUrl.substring(0, 100)}...`);

  return authUrl;
}

export async function exchangeCodeForTokens(code: string) {
  console.error("[OAuth Debug] Exchanging authorization code for tokens");
  console.error(`[OAuth Debug] Auth code (first 10 chars): ${code?.substring(0, 10) || "MISSING"}`);

  const oauth2Client = createOAuthClient();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.error("[OAuth Debug] Token exchange successful");
    return tokens;
  } catch (error) {
    console.error("[OAuth Debug] Token exchange FAILED");
    console.error("Error exchanging code for tokens:", error);

    if (error && typeof error === "object") {
      const errorResponse = error as ErrorResponse;
      const responseData =
        errorResponse.response && typeof errorResponse.response === "object" && "data" in errorResponse.response
          ? errorResponse.response.data
          : errorResponse.response;

      console.error("[OAuth Debug] Error details:", {
        message: errorResponse.message,
        code: errorResponse.code,
        status: errorResponse.status,
        response: responseData,
      });
    }

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

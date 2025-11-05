import { OAuth2Client } from "google-auth-library";
import * as Iron from "@hapi/iron";
import { GoogleBusinessProfileBusiness } from "@/types/database";

const GOOGLE_MY_BUSINESS_API_BASE =
  "https://mybusinessbusinessinformation.googleapis.com/v1";

interface GoogleAccount {
  name: string;
  accountName: string;
  type: string;
}

interface GoogleBusinessProfile {
  name: string;
  title: string;
  storefrontAddress?: {
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
    regionCode?: string;
  };
  phoneNumbers?: {
    primaryPhone?: string;
  };
  websiteUri?: string;
  metadata?: {
    mapsUri?: string;
    newReviewUri?: string;
  };
  profile?: {
    description?: string;
  };
}

interface AccountsResponse {
  accounts: GoogleAccount[];
}

interface BusinessesResponse {
  locations: GoogleBusinessProfile[];
  nextPageToken?: string;
}

function createOAuthClient(accessToken: string): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const oauth2Client = new OAuth2Client(clientId, clientSecret);
  oauth2Client.setCredentials({ access_token: accessToken });

  return oauth2Client;
}

async function makeAuthorizedRequest<T>(
  url: string,
  accessToken: string
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google API error:", response.status, errorText);
    throw new Error(`Google API request failed: ${response.status}`);
  }

  return response.json();
}

export async function getAccessTokenFromRefreshToken(
  refreshToken: string
): Promise<string> {
  const oauth2Client = createOAuthClient("");
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error("Failed to refresh access token");
  }

  return credentials.access_token;
}

async function listAccounts(accessToken: string): Promise<GoogleAccount[]> {
  try {
    const url = `${GOOGLE_MY_BUSINESS_API_BASE}/accounts`;
    const data = await makeAuthorizedRequest<AccountsResponse>(
      url,
      accessToken
    );
    return data.accounts || [];
  } catch (error) {
    console.error("Error listing accounts:", error);
    throw new Error("Failed to fetch Google Business Profile accounts");
  }
}

async function listBusinessesForAccount(
  accountName: string,
  accessToken: string
): Promise<GoogleBusinessProfile[]> {
  try {
    const allBusinesses: GoogleBusinessProfile[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const url = new URL(
        `${GOOGLE_MY_BUSINESS_API_BASE}/${accountName}/locations`
      );
      url.searchParams.set(
        "readMask",
        "name,title,storefrontAddress,phoneNumbers,websiteUri,metadata,profile"
      );
      if (pageToken) {
        url.searchParams.set("pageToken", pageToken);
      }

      const data = await makeAuthorizedRequest<BusinessesResponse>(
        url.toString(),
        accessToken
      );

      if (data.locations) {
        allBusinesses.push(...data.locations);
      }

      pageToken = data.nextPageToken;
    } while (pageToken);

    return allBusinesses;
  } catch (error) {
    console.error("Error listing businesses for account:", accountName, error);
    throw new Error("Failed to fetch businesses from Google Business Profile");
  }
}

function formatAddress(business: GoogleBusinessProfile): string {
  const address = business.storefrontAddress;
  if (!address) return "";

  const parts: string[] = [];

  if (address.addressLines && address.addressLines.length > 0) {
    parts.push(...address.addressLines);
  }

  if (address.locality) {
    parts.push(address.locality);
  }

  if (address.administrativeArea) {
    parts.push(address.administrativeArea);
  }

  if (address.postalCode) {
    parts.push(address.postalCode);
  }

  return parts.join(", ");
}

export async function listAllBusinesses(
  refreshToken: string
): Promise<GoogleBusinessProfileBusiness[]> {
  try {
    const accessToken = await getAccessTokenFromRefreshToken(refreshToken);
    const accounts = await listAccounts(accessToken);

    if (accounts.length === 0) {
      return [];
    }

    const allBusinesses: GoogleBusinessProfileBusiness[] = [];

    for (const account of accounts) {
      const businesses = await listBusinessesForAccount(
        account.name,
        accessToken
      );

      for (const business of businesses) {
        allBusinesses.push({
          accountId: account.name,
          id: business.name,
          name: business.title,
          address: formatAddress(business),
          phoneNumber: business.phoneNumbers?.primaryPhone,
          websiteUrl: business.websiteUri,
          mapsUrl: business.metadata?.mapsUri,
          description: business.profile?.description,
        });
      }
    }

    return allBusinesses;
  } catch (error) {
    console.error("Error listing all businesses:", error);
    throw new Error("Failed to fetch businesses from Google Business Profile");
  }
}

export async function decryptToken(encryptedToken: string): Promise<string> {
  const secret = process.env.TOKEN_ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error("TOKEN_ENCRYPTION_SECRET not configured");
  }

  try {
    const unsealed = await Iron.unseal(encryptedToken, secret, Iron.defaults);
    return unsealed as string;
  } catch (error) {
    console.error("Error decrypting token:", error);
    throw new Error("Failed to decrypt token");
  }
}

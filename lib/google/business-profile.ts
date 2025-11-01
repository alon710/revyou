import { OAuth2Client } from "google-auth-library";
import { GoogleBusinessProfileLocation } from "@/types/database";

const GOOGLE_MY_BUSINESS_API_BASE =
  "https://mybusinessbusinessinformation.googleapis.com/v1";

interface GoogleAccount {
  name: string;
  accountName: string;
  type: string;
}

interface GoogleLocation {
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

interface LocationsResponse {
  locations: GoogleLocation[];
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

async function listLocationsForAccount(
  accountName: string,
  accessToken: string
): Promise<GoogleLocation[]> {
  try {
    const allLocations: GoogleLocation[] = [];
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

      const data = await makeAuthorizedRequest<LocationsResponse>(
        url.toString(),
        accessToken
      );

      if (data.locations) {
        allLocations.push(...data.locations);
      }

      pageToken = data.nextPageToken;
    } while (pageToken);

    return allLocations;
  } catch (error) {
    console.error("Error listing locations for account:", accountName, error);
    throw new Error("Failed to fetch locations from Google Business Profile");
  }
}

function formatAddress(location: GoogleLocation): string {
  const address = location.storefrontAddress;
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

export async function listAllLocations(
  refreshToken: string
): Promise<GoogleBusinessProfileLocation[]> {
  try {
    const accessToken = await getAccessTokenFromRefreshToken(refreshToken);
    const accounts = await listAccounts(accessToken);

    if (accounts.length === 0) {
      return [];
    }

    const allLocations: GoogleBusinessProfileLocation[] = [];

    for (const account of accounts) {
      const locations = await listLocationsForAccount(
        account.name,
        accessToken
      );

      for (const location of locations) {
        allLocations.push({
          accountId: account.name,
          id: location.name,
          name: location.title,
          address: formatAddress(location),
          phoneNumber: location.phoneNumbers?.primaryPhone,
          websiteUrl: location.websiteUri,
          mapsUrl: location.metadata?.mapsUri,
          description: location.profile?.description,
        });
      }
    }

    return allLocations;
  } catch (error) {
    console.error("Error listing all locations:", error);
    throw new Error("Failed to fetch locations from Google Business Profile");
  }
}

export function decryptToken(encryptedToken: string): string {
  return Buffer.from(encryptedToken, "base64").toString();
}

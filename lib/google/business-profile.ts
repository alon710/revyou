import { OAuth2Client } from "google-auth-library";
import * as Iron from "@hapi/iron";
import { GoogleBusinessProfileBusiness } from "@/lib/types";
import { env } from "@/lib/env";

const GOOGLE_MY_BUSINESS_API_BASE = "https://mybusinessbusinessinformation.googleapis.com/v1";

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

function createOAuthClient(accessToken: string, clientId?: string, clientSecret?: string): OAuth2Client {
  const oauthClientId = clientId || env.GOOGLE_CLIENT_ID;
  const oauthClientSecret = clientSecret || env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${env.NEXT_PUBLIC_APP_URL}/api/google/callback`;

  const oauth2Client = new OAuth2Client(oauthClientId, oauthClientSecret, redirectUri);
  oauth2Client.setCredentials({ access_token: accessToken });

  return oauth2Client;
}

async function makeAuthorizedRequest<T>(url: string, accessToken: string): Promise<T> {
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
  refreshToken: string,
  clientId?: string,
  clientSecret?: string
): Promise<string> {
  const oauth2Client = createOAuthClient("", clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error("Failed to refresh access token");
    }

    return credentials.access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
}

async function listAccounts(accessToken: string): Promise<GoogleAccount[]> {
  try {
    const url = `${GOOGLE_MY_BUSINESS_API_BASE}/accounts`;
    const data = await makeAuthorizedRequest<AccountsResponse>(url, accessToken);
    return data.accounts || [];
  } catch (error) {
    console.error("Error listing accounts:", error);
    throw new Error("Failed to fetch Google Business Profile accounts");
  }
}

async function listBusinessesForAccount(accountName: string, accessToken: string): Promise<GoogleBusinessProfile[]> {
  try {
    const allBusinesses: GoogleBusinessProfile[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const url = new URL(`${GOOGLE_MY_BUSINESS_API_BASE}/${accountName}/locations`);
      url.searchParams.set("readMask", "name,title,storefrontAddress,phoneNumbers,websiteUri,metadata,profile");
      if (pageToken) {
        url.searchParams.set("pageToken", pageToken);
      }

      const data = await makeAuthorizedRequest<BusinessesResponse>(url.toString(), accessToken);

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

export async function listAllBusinesses(refreshToken: string): Promise<GoogleBusinessProfileBusiness[]> {
  try {
    const accessToken = await getAccessTokenFromRefreshToken(refreshToken);
    const accounts = await listAccounts(accessToken);

    if (accounts.length === 0) {
      return [];
    }

    const allBusinesses: GoogleBusinessProfileBusiness[] = [];

    for (const account of accounts) {
      const businesses = await listBusinessesForAccount(account.name, accessToken);

      for (const business of businesses) {
        const businessId = business.name.startsWith("accounts/") ? business.name : `${account.name}/${business.name}`;

        allBusinesses.push({
          accountId: account.name,
          id: businessId,
          name: business.title,
          address: formatAddress(business),
          phoneNumber: business.phoneNumbers?.primaryPhone ?? null,
          websiteUrl: business.websiteUri ?? null,
          mapsUrl: business.metadata?.mapsUri ?? null,
          description: business.profile?.description ?? null,
          photoUrl: null,
        });
      }
    }

    return allBusinesses;
  } catch (error) {
    console.error("Error listing all businesses:", error);
    throw new Error("Failed to fetch businesses from Google Business Profile");
  }
}

export async function decryptToken(encryptedToken: string, secret?: string): Promise<string> {
  const encryptionSecret = secret || env.TOKEN_ENCRYPTION_SECRET;

  try {
    const unsealed = await Iron.unseal(encryptedToken, encryptionSecret, Iron.defaults);
    return unsealed as string;
  } catch (error) {
    console.error("Error decrypting token:", error);
    throw new Error("Failed to decrypt token");
  }
}

export type NotificationType =
  | "GOOGLE_UPDATE"
  | "NEW_REVIEW"
  | "UPDATED_REVIEW"
  | "NEW_CUSTOMER_MEDIA"
  | "NEW_QUESTION"
  | "UPDATED_QUESTION"
  | "NEW_ANSWER"
  | "UPDATED_ANSWER"
  | "UPDATED_LOCATION_STATE";

interface NotificationSettings {
  name: string;
  notificationTypes: NotificationType[];
  pubsubTopic: string;
}

export async function subscribeToNotifications(
  accountName: string,
  pubsubTopic: string,
  refreshToken: string,
  notificationTypes: NotificationType[] = ["NEW_REVIEW"]
): Promise<void> {
  try {
    const accessToken = await getAccessTokenFromRefreshToken(refreshToken);
    const url = `https://mybusinessnotifications.googleapis.com/v1/${accountName}/notificationSetting?updateMask=notificationTypes,pubsubTopic`;

    const body = {
      notificationTypes,
      pubsubTopic,
    };

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error subscribing to notifications:", response.status, errorText);
      throw new Error(`Failed to subscribe to notifications: ${response.status}`);
    }

    console.log("Successfully subscribed to notifications for", accountName);
  } catch (error) {
    console.error("Error subscribing to notifications:", error);
    throw new Error("Failed to subscribe to Google My Business notifications");
  }
}

export async function unsubscribeFromNotifications(accountName: string, refreshToken: string): Promise<void> {
  try {
    const accessToken = await getAccessTokenFromRefreshToken(refreshToken);
    const url = `https://mybusinessnotifications.googleapis.com/v1/${accountName}/notificationSetting`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error unsubscribing from notifications:", response.status, errorText);
      throw new Error(`Failed to unsubscribe from notifications: ${response.status}`);
    }

    console.log("Successfully unsubscribed from notifications for", accountName);
  } catch (error) {
    console.error("Error unsubscribing from notifications:", error);
    throw new Error("Failed to unsubscribe from Google My Business notifications");
  }
}

export async function getNotificationSettings(
  accountName: string,
  refreshToken: string
): Promise<NotificationSettings | null> {
  try {
    const accessToken = await getAccessTokenFromRefreshToken(refreshToken);
    const url = `https://mybusinessnotifications.googleapis.com/v1/${accountName}/notificationSetting`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error getting notification settings:", response.status, errorText);
      throw new Error(`Failed to get notification settings: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error getting notification settings:", error);
    throw new Error("Failed to get Google My Business notification settings");
  }
}

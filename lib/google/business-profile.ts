import { google } from "googleapis";
import { getAuthenticatedClient } from "./oauth";

/**
 * Google Business Profile API Client
 * Handles all interactions with Google My Business API
 */

const mybusinessbusinessinformation = google.mybusinessbusinessinformation("v1");
const mybusinessaccountmanagement = google.mybusinessaccountmanagement("v1");

export interface GoogleLocation {
  name: string; // Resource name (e.g., "locations/12345")
  title: string; // Business name
  address: {
    addressLines?: string[];
    locality?: string; // City
    administrativeArea?: string; // State
    postalCode?: string;
    regionCode?: string; // Country code
  };
  primaryPhone?: string;
  websiteUri?: string;
  profile?: {
    description?: string;
  };
  metadata?: {
    mapsUri?: string;
    newReviewUri?: string;
  };
}

export interface GoogleAccount {
  name: string; // Resource name (e.g., "accounts/12345")
  accountName: string; // Display name
  type: string; // Account type
  role?: string; // User's role
}

export interface GoogleReview {
  name: string; // Resource name
  reviewer: {
    profilePhotoUrl?: string;
    displayName?: string;
    isAnonymous?: boolean;
  };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string; // ISO timestamp
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

/**
 * Get all Google Business accounts for the authenticated user
 * @param refreshToken - User's Google refresh token
 * @returns Array of accounts
 */
export async function getAccounts(refreshToken: string): Promise<GoogleAccount[]> {
  try {
    const auth = await getAuthenticatedClient(refreshToken);

    const response = await mybusinessaccountmanagement.accounts.list({
      auth,
    });

    return (response.data.accounts as GoogleAccount[]) || [];
  } catch (error) {
    console.error("Error fetching Google accounts:", error);
    throw new Error("לא ניתן לטעון את חשבונות Google Business");
  }
}

/**
 * Get all business locations for an account
 * @param refreshToken - User's Google refresh token
 * @param accountName - Account resource name (e.g., "accounts/12345")
 * @returns Array of locations
 */
export async function getLocations(
  refreshToken: string,
  accountName: string
): Promise<GoogleLocation[]> {
  try {
    const auth = await getAuthenticatedClient(refreshToken);

    const response = await mybusinessbusinessinformation.accounts.locations.list({
      parent: accountName,
      readMask: "name,title,storefrontAddress,phoneNumbers,websiteUri,profile,metadata",
      auth,
    });

    return (response.data.locations as GoogleLocation[]) || [];
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw new Error("לא ניתן לטעון את המיקומים");
  }
}

/**
 * Get all business locations across all accounts
 * @param refreshToken - User's Google refresh token
 * @returns Array of locations with account info
 */
export async function getAllLocations(
  refreshToken: string
): Promise<Array<GoogleLocation & { accountId: string; accountName: string }>> {
  try {
    const accounts = await getAccounts(refreshToken);
    const allLocations: Array<GoogleLocation & { accountId: string; accountName: string }> = [];

    for (const account of accounts) {
      const locations = await getLocations(refreshToken, account.name);
      const locationsWithAccount = locations.map((loc) => ({
        ...loc,
        accountId: account.name,
        accountName: account.accountName,
      }));
      allLocations.push(...locationsWithAccount);
    }

    return allLocations;
  } catch (error) {
    console.error("Error fetching all locations:", error);
    throw new Error("לא ניתן לטעון את כל המיקומים");
  }
}

/**
 * Get a single location by name
 * @param refreshToken - User's Google refresh token
 * @param locationName - Location resource name
 * @returns Location details
 */
export async function getLocation(
  refreshToken: string,
  locationName: string
): Promise<GoogleLocation> {
  try {
    const auth = await getAuthenticatedClient(refreshToken);

    const response = await mybusinessbusinessinformation.locations.get({
      name: locationName,
      readMask: "name,title,storefrontAddress,phoneNumbers,websiteUri,profile,metadata",
      auth,
    });

    return response.data as GoogleLocation;
  } catch (error) {
    console.error("Error fetching location:", error);
    throw new Error("לא ניתן לטעון את פרטי המיקום");
  }
}

/**
 * Format address from Google location
 * @param location - Google location object
 * @returns Formatted address string
 */
export function formatAddress(location: GoogleLocation): string {
  const addr = location.address;
  if (!addr) return "";

  const parts = [
    ...(addr.addressLines || []),
    addr.locality,
    addr.administrativeArea,
    addr.postalCode,
  ].filter(Boolean);

  return parts.join(", ");
}

/**
 * Extract location ID from resource name
 * @param resourceName - Location resource name (e.g., "locations/12345")
 * @returns Location ID
 */
export function extractLocationId(resourceName: string): string {
  return resourceName.split("/").pop() || "";
}

/**
 * Extract account ID from resource name
 * @param resourceName - Account resource name (e.g., "accounts/12345")
 * @returns Account ID
 */
export function extractAccountId(resourceName: string): string {
  return resourceName.split("/").pop() || "";
}

/**
 * Convert star rating enum to number
 * @param starRating - Google star rating enum
 * @returns Number 1-5
 */
export function convertStarRating(
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE"
): number {
  const map = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  };
  return map[starRating] || 0;
}

/**
 * Get reviews for a location
 * Note: This requires Google My Business API v4.9 which is being deprecated
 * The new Business Profile API doesn't expose reviews directly
 * Reviews should come via Pub/Sub notifications
 * @param refreshToken - User's Google refresh token
 * @param locationName - Location resource name
 * @returns Array of reviews
 */
export async function getReviews(
  _refreshToken: string,
  _locationName: string
): Promise<GoogleReview[]> {
  try {
    // Note: The new Business Profile API doesn't provide a reviews.list endpoint
    // Reviews are received via Pub/Sub notifications
    // This is a placeholder for future implementation
    console.warn("Reviews should be fetched via Pub/Sub notifications");
    return [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw new Error("לא ניתן לטעון את הביקורות");
  }
}

/**
 * Post a reply to a review
 * @param refreshToken - User's Google refresh token
 * @param reviewName - Review resource name
 * @param replyText - Reply text
 */
export async function postReviewReply(
  _refreshToken: string,
  _reviewName: string,
  _replyText: string
): Promise<void> {
  try {
    // TODO: Implement with proper API when available
    // const auth = await getAuthenticatedClient(refreshToken);
    // Note: Business Profile API v1 doesn't have direct reply endpoint yet
    throw new Error("פיצ'ר זה עדיין לא זמין");
  } catch (error) {
    console.error("Error posting review reply:", error);
    throw new Error("לא ניתן לפרסם את התגובה");
  }
}

/**
 * Delete a review reply
 * @param _refreshToken - User's Google refresh token
 * @param _reviewName - Review resource name
 */
export async function deleteReviewReply(
  _refreshToken: string,
  _reviewName: string
): Promise<void> {
  try {
    // TODO: Implement with proper API when available
    throw new Error("פיצ'ר זה עדיין לא זמין");
  } catch (error) {
    console.error("Error deleting review reply:", error);
    throw new Error("לא ניתן למחוק את התגובה");
  }
}

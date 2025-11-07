import { getAccessTokenFromRefreshToken } from "./business-profile";

// Using My Business API v4 for reviews (still functional despite v4 being deprecated)
// Reviews are not yet available in the newer Business Profile APIs
const GOOGLE_MY_BUSINESS_API_BASE = "https://mybusiness.googleapis.com/v4";

export enum StarRating {
  STAR_RATING_UNSPECIFIED = "STAR_RATING_UNSPECIFIED",
  ONE = "ONE",
  TWO = "TWO",
  THREE = "THREE",
  FOUR = "FOUR",
  FIVE = "FIVE",
}

interface GoogleReviewer {
  profilePhotoUrl?: string;
  displayName: string;
  isAnonymous?: boolean; // Optional - Google API doesn't always return this field
}

interface GoogleReviewReply {
  comment: string;
  updateTime: string;
}

export interface GoogleReview {
  name: string;
  reviewId: string;
  reviewer: GoogleReviewer;
  starRating: StarRating;
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: GoogleReviewReply;
}

async function makeAuthorizedRequest<T>(
  url: string,
  accessToken: string,
  method: string = "GET",
  body?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`Making ${method} request to: ${url}`);
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google API error:", {
      status: response.status,
      statusText: response.statusText,
      url,
      method,
      errorBody: errorText,
    });
    throw new Error(
      `Google API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetches a single review from Google My Business API
 * @param reviewName - Full resource name: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
 * @param refreshToken - Encrypted refresh token
 * @returns Google Review object
 */
export async function getReview(
  reviewName: string,
  refreshToken: string,
  clientId?: string,
  clientSecret?: string
): Promise<GoogleReview> {
  try {
    console.log("Fetching review:", reviewName);
    const accessToken = await getAccessTokenFromRefreshToken(
      refreshToken,
      clientId,
      clientSecret
    );
    const url = `${GOOGLE_MY_BUSINESS_API_BASE}/${reviewName}`;
    console.log("Review API URL:", url);

    const review = await makeAuthorizedRequest<GoogleReview>(url, accessToken);
    console.log("Successfully fetched review:", review.reviewId);
    return review;
  } catch (error) {
    console.error("Error fetching review:", {
      reviewName,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Posts a reply to a review on Google My Business
 * @param reviewName - Full resource name: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
 * @param replyText - The text of the reply to post
 * @param refreshToken - OAuth refresh token
 * @param clientId - Optional OAuth client ID (for Cloud Functions)
 * @param clientSecret - Optional OAuth client secret (for Cloud Functions)
 * @returns The posted review reply
 */
export async function postReplyToGoogle(
  reviewName: string,
  replyText: string,
  refreshToken: string,
  clientId?: string,
  clientSecret?: string
): Promise<GoogleReviewReply> {
  try {
    console.log("Posting reply to Google for review:", reviewName);
    const accessToken = await getAccessTokenFromRefreshToken(
      refreshToken,
      clientId,
      clientSecret
    );
    const url = `${GOOGLE_MY_BUSINESS_API_BASE}/${reviewName}/reply`;
    console.log("Reply API URL:", url);

    const reply = await makeAuthorizedRequest<GoogleReviewReply>(
      url,
      accessToken,
      "PUT",
      { comment: replyText }
    );
    console.log("Successfully posted reply to Google");
    return reply;
  } catch (error) {
    console.error("Error posting reply to Google:", {
      reviewName,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Converts GMB StarRating enum to numeric rating (1-5)
 */
export function starRatingToNumber(starRating: StarRating): number {
  switch (starRating) {
    case StarRating.ONE:
      return 1;
    case StarRating.TWO:
      return 2;
    case StarRating.THREE:
      return 3;
    case StarRating.FOUR:
      return 4;
    case StarRating.FIVE:
      return 5;
    default:
      throw new Error(`Invalid star rating: ${starRating}`);
  }
}

/**
 * Parses ISO 8601 timestamp to JavaScript Date
 */
export function parseGoogleTimestamp(timestamp: string): Date {
  return new Date(timestamp);
}

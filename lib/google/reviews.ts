import { getAccessTokenFromRefreshToken } from "./business-profile";

const GOOGLE_MY_BUSINESS_API_BASE =
  "https://mybusinessbusinessinformation.googleapis.com/v1";

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
  isAnonymous: boolean;
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

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google API error:", response.status, errorText);
    throw new Error(`Google API request failed: ${response.status}`);
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
  refreshToken: string
): Promise<GoogleReview> {
  try {
    const accessToken = await getAccessTokenFromRefreshToken(refreshToken);
    const url = `${GOOGLE_MY_BUSINESS_API_BASE}/${reviewName}`;

    const review = await makeAuthorizedRequest<GoogleReview>(url, accessToken);
    return review;
  } catch (error) {
    console.error("Error fetching review:", reviewName, error);
    throw new Error("Failed to fetch review from Google My Business API");
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

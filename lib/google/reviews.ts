import { getAccessTokenFromRefreshToken } from "./business-profile";

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
  isAnonymous?: boolean;
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
    console.error("Google API error:", {
      status: response.status,
      statusText: response.statusText,
      url,
      method,
      errorBody: errorText,
    });
    throw new Error(`Google API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getReview(
  reviewName: string,
  refreshToken: string,
  clientId?: string,
  clientSecret?: string
): Promise<GoogleReview> {
  try {
    const accessToken = await getAccessTokenFromRefreshToken(refreshToken, clientId, clientSecret);
    const url = `${GOOGLE_MY_BUSINESS_API_BASE}/${reviewName}`;

    const review = await makeAuthorizedRequest<GoogleReview>(url, accessToken);
    return review;
  } catch (error) {
    console.error("Error fetching review:", {
      reviewName,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function postReplyToGoogle(
  reviewName: string,
  replyText: string,
  refreshToken: string,
  clientId?: string,
  clientSecret?: string
): Promise<GoogleReviewReply> {
  try {
    const accessToken = await getAccessTokenFromRefreshToken(refreshToken, clientId, clientSecret);
    const url = `${GOOGLE_MY_BUSINESS_API_BASE}/${reviewName}/reply`;

    const reply = await makeAuthorizedRequest<GoogleReviewReply>(url, accessToken, "PUT", { comment: replyText });
    return reply;
  } catch (error) {
    console.error("Error posting reply to Google:", {
      reviewName,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

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

export function parseGoogleTimestamp(timestamp: string): Date {
  return new Date(timestamp);
}

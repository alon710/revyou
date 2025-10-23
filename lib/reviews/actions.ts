import {
  approveReply as approveReplyFb,
  rejectReply as rejectReplyFb,
  updateReviewReply,
} from "@/lib/firebase/reviews";

/**
 * Client-side review actions
 * These functions wrap Firestore operations and API calls
 */

/**
 * Approve a review reply
 * @param reviewId - Review document ID
 */
export async function approveReply(reviewId: string): Promise<void> {
  await approveReplyFb(reviewId);
}

/**
 * Reject a review reply
 * @param reviewId - Review document ID
 */
export async function rejectReply(reviewId: string): Promise<void> {
  await rejectReplyFb(reviewId);
}

/**
 * Edit a review reply
 * @param reviewId - Review document ID
 * @param newReply - New reply text
 */
export async function editReply(
  reviewId: string,
  newReply: string
): Promise<void> {
  await updateReviewReply(reviewId, newReply, true);
}

/**
 * Regenerate AI reply (calls API route)
 * @param reviewId - Review document ID
 * @param token - Firebase ID token
 * @returns Generated reply text
 */
export async function regenerateReply(
  reviewId: string,
  token: string
): Promise<string> {
  const response = await fetch(`/api/reviews/${reviewId}/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate reply");
  }

  const data = await response.json();
  return data.aiReply;
}

/**
 * Post reply to Google (calls API route)
 * @param reviewId - Review document ID
 * @param token - Firebase ID token
 */
export async function postReplyToGoogle(
  reviewId: string,
  token: string
): Promise<void> {
  const response = await fetch(`/api/reviews/${reviewId}/post`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to post reply");
  }
}

/**
 * Enable notifications for a business (calls API route)
 * @param businessId - Business document ID
 * @param token - Firebase ID token
 */
export async function enableNotificationsForBusiness(
  businessId: string,
  token: string
): Promise<void> {
  const response = await fetch("/api/google/notifications", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ businessId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to enable notifications");
  }
}

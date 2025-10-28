import {
  rejectReply as rejectReplyFb,
  updateReviewReply,
} from "@/lib/firebase/review-replies";

export async function rejectReply(
  userId: string,
  locationId: string,
  reviewId: string
): Promise<void> {
  await rejectReplyFb(userId, locationId, reviewId);
}

export async function editReply(
  userId: string,
  locationId: string,
  reviewId: string,
  newReply: string
): Promise<void> {
  await updateReviewReply(userId, locationId, reviewId, newReply, true);
}

export async function regenerateReply(
  userId: string,
  locationId: string,
  reviewId: string,
  token: string
): Promise<string> {
  const response = await fetch(`/api/reviews/${reviewId}/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, locationId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate reply");
  }

  const data = await response.json();
  return data.aiReply;
}

export async function postReplyToGoogle(
  userId: string,
  locationId: string,
  reviewId: string,
  token: string
): Promise<void> {
  const response = await fetch(`/api/reviews/${reviewId}/post`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, locationId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to post reply");
  }
}

export async function rejectReply(
  userId: string,
  accountId: string,
  businessId: string,
  reviewId: string
): Promise<void> {
  const response = await fetch(
    `/api/users/${userId}/accounts/${accountId}/businesses/${businessId}/reviews/${reviewId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replyStatus: "rejected" }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to reject reply");
  }
}

export async function editReply(
  userId: string,
  accountId: string,
  businessId: string,
  reviewId: string,
  newReply: string
): Promise<void> {
  const response = await fetch(
    `/api/users/${userId}/accounts/${accountId}/businesses/${businessId}/reviews/${reviewId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiReply: newReply }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to edit reply");
  }
}

export async function regenerateReply(
  userId: string,
  accountId: string,
  businessId: string,
  reviewId: string,
  token: string
): Promise<string> {
  const response = await fetch(
    `/api/users/${userId}/accounts/${accountId}/businesses/${businessId}/reviews/${reviewId}/generate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate reply");
  }

  const data = await response.json();
  return data.aiReply;
}

export async function postReplyToGoogle(
  userId: string,
  accountId: string,
  businessId: string,
  reviewId: string,
  token: string,
  reply?: string
): Promise<void> {
  const response = await fetch(
    `/api/users/${userId}/accounts/${accountId}/businesses/${businessId}/reviews/${reviewId}/post`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to post reply");
  }
}

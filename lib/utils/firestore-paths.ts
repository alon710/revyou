export const firestorePaths = {
  user: (userId: string) => `users/${userId}`,

  accounts: (userId: string) => `${firestorePaths.user(userId)}/accounts`,

  account: (userId: string, accountId: string) =>
    `${firestorePaths.accounts(userId)}/${accountId}`,

  businesses: (userId: string, accountId: string) =>
    `${firestorePaths.account(userId, accountId)}/businesses`,

  business: (userId: string, accountId: string, businessId: string) =>
    `${firestorePaths.businesses(userId, accountId)}/${businessId}`,

  reviews: (userId: string, accountId: string, businessId: string) =>
    `${firestorePaths.business(userId, accountId, businessId)}/reviews`,

  review: (
    userId: string,
    accountId: string,
    businessId: string,
    reviewId: string
  ) => `${firestorePaths.reviews(userId, accountId, businessId)}/${reviewId}`,
};

export function parseFirestorePath(path: string): {
  userId?: string;
  accountId?: string;
  businessId?: string;
  reviewId?: string;
} {
  const parts = path.split("/");
  const result: Record<string, string> = {};

  for (let i = 0; i < parts.length; i += 2) {
    const collection = parts[i];
    const id = parts[i + 1];

    if (collection === "users") result.userId = id;
    else if (collection === "accounts") result.accountId = id;
    else if (collection === "businesses") result.businessId = id;
    else if (collection === "reviews") result.reviewId = id;
  }

  return result;
}

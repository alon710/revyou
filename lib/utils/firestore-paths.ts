/**
 * Centralized Firestore path builder
 * Replaces 15+ hardcoded path constructions across the codebase
 *
 * Usage:
 * const path = firestorePaths.review(userId, accountId, businessId, reviewId)
 * // Returns: users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews/{reviewId}
 */

export const firestorePaths = {
  /**
   * Path to a specific user document
   * @example users/{userId}
   */
  user: (userId: string) => `users/${userId}`,

  /**
   * Path to user's accounts collection
   * @example users/{userId}/accounts
   */
  accounts: (userId: string) => `${firestorePaths.user(userId)}/accounts`,

  /**
   * Path to a specific account document
   * @example users/{userId}/accounts/{accountId}
   */
  account: (userId: string, accountId: string) =>
    `${firestorePaths.accounts(userId)}/${accountId}`,

  /**
   * Path to account's businesses collection
   * @example users/{userId}/accounts/{accountId}/businesses
   */
  businesses: (userId: string, accountId: string) =>
    `${firestorePaths.account(userId, accountId)}/businesses`,

  /**
   * Path to a specific business document
   * @example users/{userId}/accounts/{accountId}/businesses/{businessId}
   */
  business: (userId: string, accountId: string, businessId: string) =>
    `${firestorePaths.businesses(userId, accountId)}/${businessId}`,

  /**
   * Path to business's reviews collection
   * @example users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews
   */
  reviews: (userId: string, accountId: string, businessId: string) =>
    `${firestorePaths.business(userId, accountId, businessId)}/reviews`,

  /**
   * Path to a specific review document
   * @example users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews/{reviewId}
   */
  review: (
    userId: string,
    accountId: string,
    businessId: string,
    reviewId: string
  ) => `${firestorePaths.reviews(userId, accountId, businessId)}/${reviewId}`,
};

/**
 * Parse a full Firestore path into its component IDs
 * Useful for extracting IDs from document references
 */
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

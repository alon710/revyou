/**
 * Generic sort options structure
 * All sort options are always optional
 */
export interface SortOptions<T extends string> {
  orderBy: T;
  orderDirection: "asc" | "desc";
}

// Entity-specific sort field types
export type ReviewSortField = "receivedAt" | "rating" | "date";
export type ReviewSortOptions = SortOptions<ReviewSortField>;

export type BusinessSortField = "connectedAt" | "name";
export type BusinessSortOptions = SortOptions<BusinessSortField>;

export type AccountSortField = "connectedAt" | "email";
export type AccountSortOptions = SortOptions<AccountSortField>;

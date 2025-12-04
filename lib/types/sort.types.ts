export interface SortOptions<T extends string> {
  orderBy: T;
  orderDirection: "asc" | "desc";
}

export type ReviewSortField = "receivedAt" | "rating" | "date" | "replyStatus";
export type ReviewSortOptions = SortOptions<ReviewSortField>;

export type BusinessSortField = "connectedAt" | "name";
export type BusinessSortOptions = SortOptions<BusinessSortField>;

export type AccountSortField = "connectedAt" | "email";
export type AccountSortOptions = SortOptions<AccountSortField>;

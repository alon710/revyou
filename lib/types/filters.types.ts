import { ReplyStatus } from "./review.types";
import { ReviewSortOptions, BusinessSortOptions, AccountSortOptions } from "./sort.types";

export interface ReviewFilters {
  ids?: string[];
  replyStatus?: ReplyStatus[];
  rating?: number[];
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
  sort?: ReviewSortOptions;
}

export interface BusinessFilters {
  ids?: string[];
  connected?: boolean;
  limit?: number;
  offset?: number;
  sort?: BusinessSortOptions;
}

export interface AccountFilters {
  ids?: string[];
  email?: string;
  limit?: number;
  offset?: number;
  sort?: AccountSortOptions;
}

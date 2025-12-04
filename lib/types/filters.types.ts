import { ReplyStatus } from "./review.types";
import { SortOptions, ReviewSortOptions } from "./sort.types";

export interface TFilters {
  ids?: string[];
  limit?: number;
  offset?: number;
  sort?: SortOptions<string>;
}
export interface ReviewFilters extends TFilters {
  replyStatus?: ReplyStatus[];
  rating?: number[];
  dateFrom?: Date;
  dateTo?: Date;
  sort?: ReviewSortOptions;
}

export interface BusinessFilters extends TFilters {
  connected?: boolean;
}

export interface AccountFilters extends TFilters {
  email?: string;
}

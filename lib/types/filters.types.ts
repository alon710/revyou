import { ReplyStatus } from "./review.types";
import {
  ReviewSortOptions,
  BusinessSortOptions,
  AccountSortOptions,
} from "./sort.types";

/**
 * Filter interfaces for querying entities
 * All filters are optional to support flexible querying
 */

export interface ReviewFilters {
  ids?: string[];
  replyStatus?: ReplyStatus[];
  rating?: number[];
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
  sort?: ReviewSortOptions; // Always optional
}

export interface BusinessFilters {
  ids?: string[];
  connected?: boolean;
  limit?: number;
  offset?: number;
  sort?: BusinessSortOptions; // Always optional
}

export interface AccountFilters {
  ids?: string[];
  email?: string;
  limit?: number;
  offset?: number;
  sort?: AccountSortOptions; // Always optional
}

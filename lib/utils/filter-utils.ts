import { ReviewFilters, ReviewSortField } from "@/lib/types";
import { format } from "date-fns";

export function parseFiltersFromSearchParams(searchParams: {
  [key: string]: string | string[] | undefined;
}): ReviewFilters {
  const filters: ReviewFilters = {};

  const replyStatus = searchParams.replyStatus;
  if (typeof replyStatus === "string") {
    filters.replyStatus = replyStatus.split(",") as ("pending" | "rejected" | "posted" | "failed" | "quota_exceeded")[];
  }

  const rating = searchParams.rating;
  if (typeof rating === "string") {
    filters.rating = rating.split(",").map(Number);
  }

  if (typeof searchParams.dateFrom === "string") {
    filters.dateFrom = new Date(searchParams.dateFrom);
  }
  if (typeof searchParams.dateTo === "string") {
    filters.dateTo = new Date(searchParams.dateTo);
  }

  if (typeof searchParams.sortBy === "string") {
    filters.sort = {
      orderBy: searchParams.sortBy as ReviewSortField,
      orderDirection: (searchParams.sortDir as "asc" | "desc") || "desc",
    };
  }

  return filters;
}

export function buildSearchParams(filters: ReviewFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.replyStatus?.length) {
    params.set("replyStatus", filters.replyStatus.join(","));
  }

  if (filters.rating?.length) {
    params.set("rating", filters.rating.join(","));
  }

  if (filters.dateFrom) {
    params.set("dateFrom", format(filters.dateFrom, "yyyy-MM-dd"));
  }

  if (filters.dateTo) {
    params.set("dateTo", format(filters.dateTo, "yyyy-MM-dd"));
  }

  if (filters.sort) {
    params.set("sortBy", filters.sort.orderBy);
    params.set("sortDir", filters.sort.orderDirection);
  }

  return params;
}

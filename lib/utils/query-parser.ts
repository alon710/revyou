import { z } from "zod";
import { ReviewFilters, BusinessFilters, AccountFilters } from "@/lib/types";

export function parseSearchParams<T>(params: URLSearchParams, schema: z.ZodType<T, any, any>): T {
  const obj: Record<string, any> = {};

  for (const key of Array.from(new Set(params.keys()))) {
    const values = params.getAll(key);
    obj[key] = values.length === 1 ? values[0] : values;
  }

  return schema.parse(obj);
}

const arrayTransform = <T>(value: string | string[] | undefined, transform?: (v: string) => T): T[] | undefined => {
  if (!value) return undefined;

  const arr = Array.isArray(value) ? value : value.split(",");
  return transform ? arr.map(transform) : (arr as unknown as T[]);
};

export const reviewFiltersSchema = z
  .object({
    ids: z.union([z.string(), z.array(z.string())]).optional(),
    replyStatus: z
      .union([
        z.enum(["pending", "rejected", "posted", "failed"]),
        z.array(z.enum(["pending", "rejected", "posted", "failed"])),
      ])
      .optional(),
    rating: z.union([z.string(), z.array(z.string())]).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
    orderBy: z.enum(["receivedAt", "rating", "date"]).optional(),
    orderDirection: z.enum(["asc", "desc"]).optional(),
  })
  .transform((data) => {
    const filters: ReviewFilters = {};

    if (data.ids) {
      filters.ids = arrayTransform(data.ids);
    }

    if (data.replyStatus) {
      filters.replyStatus = arrayTransform(data.replyStatus) as ReviewFilters["replyStatus"];
    }

    if (data.rating) {
      filters.rating = arrayTransform(data.rating, (v) => parseInt(v, 10));
    }

    if (data.dateFrom) {
      filters.dateFrom = new Date(data.dateFrom);
    }
    if (data.dateTo) {
      filters.dateTo = new Date(data.dateTo);
    }

    if (data.limit) {
      filters.limit = parseInt(data.limit, 10);
    }
    if (data.offset) {
      filters.offset = parseInt(data.offset, 10);
    }

    if (data.orderBy) {
      filters.sort = {
        orderBy: data.orderBy,
        orderDirection: data.orderDirection || "desc",
      };
    }

    return filters;
  });

export const businessFiltersSchema = z
  .object({
    ids: z.union([z.string(), z.array(z.string())]).optional(),
    connected: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
    orderBy: z.enum(["connectedAt", "name"]).optional(),
    orderDirection: z.enum(["asc", "desc"]).optional(),
  })
  .transform((data) => {
    const filters: BusinessFilters = {};

    if (data.ids) {
      filters.ids = arrayTransform(data.ids);
    }

    if (data.connected !== undefined) {
      filters.connected = data.connected === "true";
    }

    if (data.limit) {
      filters.limit = parseInt(data.limit, 10);
    }

    if (data.offset) {
      filters.offset = parseInt(data.offset, 10);
    }

    if (data.orderBy) {
      filters.sort = {
        orderBy: data.orderBy,
        orderDirection: data.orderDirection || "desc",
      };
    }

    return filters;
  });

export const accountFiltersSchema = z
  .object({
    ids: z.union([z.string(), z.array(z.string())]).optional(),
    email: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
    orderBy: z.enum(["connectedAt", "email"]).optional(),
    orderDirection: z.enum(["asc", "desc"]).optional(),
  })
  .transform((data) => {
    const filters: AccountFilters = {};

    if (data.ids) {
      filters.ids = arrayTransform(data.ids);
    }

    if (data.email) {
      filters.email = data.email;
    }

    if (data.limit) {
      filters.limit = parseInt(data.limit, 10);
    }

    if (data.offset) {
      filters.offset = parseInt(data.offset, 10);
    }

    if (data.orderBy) {
      filters.sort = {
        orderBy: data.orderBy,
        orderDirection: data.orderDirection || "desc",
      };
    }

    return filters;
  });

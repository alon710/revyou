import { z } from "zod";
import { ReviewFilters, BusinessFilters, AccountFilters } from "@/lib/types";

export function parseSearchParams<T>(params: URLSearchParams, schema: z.ZodType<T, z.ZodTypeDef, unknown>): T {
  const obj: Record<
    string,
    string | string[] | undefined | number | number[] | boolean | boolean[] | Date | Date[] | null | null[]
  > = {};

  for (const key of Array.from(new Set(params.keys()))) {
    const values = params.getAll(key);
    obj[key] = values.length === 1 ? values[0] : values;
  }

  return schema.parse(obj);
}

const stringOrArraySchema = z
  .union([z.string(), z.array(z.string())])
  .transform((val) => (Array.isArray(val) ? val : val.split(",")));

const replyStatusArraySchema = z
  .union([
    z.enum(["pending", "rejected", "posted", "failed"]),
    z.array(z.enum(["pending", "rejected", "posted", "failed"])),
  ])
  .transform((val) => (Array.isArray(val) ? val : [val]));

const ratingArraySchema = z.union([z.string(), z.array(z.string())]).transform((val) => {
  const arr = Array.isArray(val) ? val : val.split(",");
  return arr.map((v) => parseInt(v, 10));
});

export const reviewFiltersSchema = z
  .object({
    ids: stringOrArraySchema.optional(),
    replyStatus: replyStatusArraySchema.optional(),
    rating: ratingArraySchema.optional(),
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
      filters.ids = data.ids;
    }

    if (data.replyStatus) {
      filters.replyStatus = data.replyStatus;
    }

    if (data.rating) {
      filters.rating = data.rating;
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
    ids: stringOrArraySchema.optional(),
    connected: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
    orderBy: z.enum(["connectedAt", "name"]).optional(),
    orderDirection: z.enum(["asc", "desc"]).optional(),
  })
  .transform((data) => {
    const filters: BusinessFilters = {};

    if (data.ids) {
      filters.ids = data.ids;
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
    ids: stringOrArraySchema.optional(),
    email: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
    orderBy: z.enum(["connectedAt", "email"]).optional(),
    orderDirection: z.enum(["asc", "desc"]).optional(),
  })
  .transform((data) => {
    const filters: AccountFilters = {};

    if (data.ids) {
      filters.ids = data.ids;
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

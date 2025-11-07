import { z } from "zod";
import { ReviewFilters, BusinessFilters, AccountFilters } from "@/lib/types";

/**
 * Parses and validates URLSearchParams using a Zod schema
 * Handles arrays, type coercion, and default values
 *
 * @example
 * // In API route:
 * const filters = parseSearchParams(req.nextUrl.searchParams, reviewFiltersSchema)
 * // Returns fully typed and validated ReviewFilters object
 */
export function parseSearchParams<T>(
  params: URLSearchParams,
  schema: z.ZodType<T, any, any>
): T {
  const obj: Record<string, any> = {};

  // Build object from URLSearchParams
  for (const key of Array.from(new Set(params.keys()))) {
    const values = params.getAll(key);
    obj[key] = values.length === 1 ? values[0] : values;
  }

  return schema.parse(obj);
}

/**
 * Helper to normalize array values from query params
 * Converts single values to arrays, handles comma-separated strings
 */
const arrayTransform = <T>(
  value: string | string[] | undefined,
  transform?: (v: string) => T
): T[] | undefined => {
  if (!value) return undefined;

  const arr = Array.isArray(value) ? value : value.split(",");
  return transform ? arr.map(transform) : (arr as unknown as T[]);
};

/**
 * Zod schema for parsing review filter query parameters
 *
 * @example
 * GET /api/.../reviews?replyStatus=pending&replyStatus=posted&rating=1&rating=2&limit=20&orderBy=receivedAt&orderDirection=desc
 */
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

    // Handle IDs
    if (data.ids) {
      filters.ids = arrayTransform(data.ids);
    }

    // Handle reply status
    if (data.replyStatus) {
      filters.replyStatus = arrayTransform(
        data.replyStatus
      ) as ReviewFilters["replyStatus"];
    }

    // Handle ratings (convert strings to numbers)
    if (data.rating) {
      filters.rating = arrayTransform(data.rating, (v) => parseInt(v, 10));
    }

    // Handle dates
    if (data.dateFrom) {
      filters.dateFrom = new Date(data.dateFrom);
    }
    if (data.dateTo) {
      filters.dateTo = new Date(data.dateTo);
    }

    // Handle pagination
    if (data.limit) {
      filters.limit = parseInt(data.limit, 10);
    }
    if (data.offset) {
      filters.offset = parseInt(data.offset, 10);
    }

    // Handle sorting
    if (data.orderBy) {
      filters.sort = {
        orderBy: data.orderBy,
        orderDirection: data.orderDirection || "desc",
      };
    }

    return filters;
  });

/**
 * Zod schema for parsing business filter query parameters
 *
 * @example
 * GET /api/.../businesses?connected=true&limit=50&orderBy=name&orderDirection=asc
 */
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

/**
 * Zod schema for parsing account filter query parameters
 *
 * @example
 * GET /api/.../accounts?email=user@example.com&limit=50&orderBy=connectedAt&orderDirection=desc
 */
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

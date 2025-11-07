import {
  query,
  where,
  orderBy,
  limit,
  Query,
  DocumentData,
  CollectionReference,
  Timestamp,
} from "firebase/firestore";
import type {
  ReviewFilters,
  BusinessFilters,
  AccountFilters,
} from "@/lib/types";

/**
 * Firestore Query Builder
 * Dynamically builds Firestore queries based on filter objects
 * Utilizes existing Firestore indexes:
 * - reviews: [replyStatus ASC, receivedAt DESC]
 * - reviews: [rating ASC, receivedAt DESC]
 * - reviews: [rating ASC, replyStatus ASC, receivedAt DESC]
 * - businesses: [connected ASC, connectedAt DESC]
 * - accounts: [connectedAt DESC, __name__ ASC]
 */

export class QueryBuilder {
  /**
   * Build a Firestore query for reviews with filters
   * Uses existing composite indexes for optimal performance
   */
  static buildReviewQuery(
    baseRef: CollectionReference<DocumentData>,
    filters: ReviewFilters = {}
  ): Query<DocumentData> {
    let q: Query<DocumentData> = baseRef;

    // Apply filters (using existing indexes)
    if (filters.replyStatus && filters.replyStatus.length > 0) {
      // Use 'in' operator for multiple statuses (max 10)
      if (filters.replyStatus.length <= 10) {
        q = query(q, where("replyStatus", "in", filters.replyStatus));
      } else {
        // Fallback to first status if more than 10
        q = query(q, where("replyStatus", "==", filters.replyStatus[0]));
      }
    }

    if (filters.rating && filters.rating.length > 0) {
      // Use 'in' operator for multiple ratings (max 10)
      if (filters.rating.length <= 10) {
        q = query(q, where("rating", "in", filters.rating));
      } else {
        // Fallback to first rating if more than 10
        q = query(q, where("rating", "==", filters.rating[0]));
      }
    }

    // Date range filters
    if (filters.dateFrom) {
      const timestamp = Timestamp.fromDate(filters.dateFrom);
      q = query(q, where("receivedAt", ">=", timestamp));
    }

    if (filters.dateTo) {
      const timestamp = Timestamp.fromDate(filters.dateTo);
      q = query(q, where("receivedAt", "<=", timestamp));
    }

    // Apply sorting (defaults to receivedAt desc to match existing index)
    const sortField = filters.sort?.orderBy || "receivedAt";
    const sortDirection = filters.sort?.orderDirection || "desc";
    q = query(q, orderBy(sortField, sortDirection));

    // Apply pagination
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    // Note: offset is handled differently - we'd need to use startAfter with a cursor
    // For now, client can implement cursor-based pagination

    return q;
  }

  /**
   * Build a Firestore query for businesses with filters
   * Uses existing index: [connected ASC, connectedAt DESC]
   */
  static buildBusinessQuery(
    baseRef: CollectionReference<DocumentData>,
    filters: BusinessFilters = {}
  ): Query<DocumentData> {
    let q: Query<DocumentData> = baseRef;

    // Filter by connection status
    if (filters.connected !== undefined) {
      q = query(q, where("connected", "==", filters.connected));
    }

    // Apply sorting (defaults to connectedAt desc)
    const sortField = filters.sort?.orderBy || "connectedAt";
    const sortDirection = filters.sort?.orderDirection || "desc";
    q = query(q, orderBy(sortField, sortDirection));

    // Apply pagination
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    return q;
  }

  /**
   * Build a Firestore query for accounts with filters
   * Uses existing index: [connectedAt DESC, __name__ ASC]
   */
  static buildAccountQuery(
    baseRef: CollectionReference<DocumentData>,
    filters: AccountFilters = {}
  ): Query<DocumentData> {
    let q: Query<DocumentData> = baseRef;

    // Email filter (exact match)
    // Note: For email search, we'll need to iterate and filter client-side
    // or create a new index. This is a known limitation.
    if (filters.email) {
      q = query(q, where("email", "==", filters.email));
    }

    // Apply sorting (defaults to connectedAt desc)
    const sortField = filters.sort?.orderBy || "connectedAt";
    const sortDirection = filters.sort?.orderDirection || "desc";
    q = query(q, orderBy(sortField, sortDirection));

    // Apply pagination
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    return q;
  }

  /**
   * Filter results by IDs client-side (after query execution)
   * Firestore doesn't support 'in' queries with more than 10 items
   * and combining 'in' with other filters can be problematic
   */
  static filterByIds<T extends { id: string }>(
    results: T[],
    ids?: string[]
  ): T[] {
    if (!ids || ids.length === 0) return results;
    const idSet = new Set(ids);
    return results.filter((item) => idSet.has(item.id));
  }

  /**
   * Apply client-side pagination (offset-based)
   * Note: For better performance, use cursor-based pagination in production
   */
  static applyOffset<T>(results: T[], offset?: number): T[] {
    if (!offset || offset === 0) return results;
    return results.slice(offset);
  }
}

/**
 * Admin SDK Query Builder (for server-side operations)
 * Same logic but uses admin SDK Query types
 */
export class AdminQueryBuilder {
  /**
   * Build query using Admin SDK (server-side)
   * Note: Admin SDK has slightly different API but same concepts
   */
  static buildReviewQuery(
    baseRef: FirebaseFirestore.CollectionReference,
    filters: ReviewFilters = {}
  ): FirebaseFirestore.Query {
    let q: FirebaseFirestore.Query = baseRef;

    if (filters.replyStatus && filters.replyStatus.length > 0) {
      if (filters.replyStatus.length <= 10) {
        q = q.where("replyStatus", "in", filters.replyStatus);
      } else {
        q = q.where("replyStatus", "==", filters.replyStatus[0]);
      }
    }

    if (filters.rating && filters.rating.length > 0) {
      if (filters.rating.length <= 10) {
        q = q.where("rating", "in", filters.rating);
      } else {
        q = q.where("rating", "==", filters.rating[0]);
      }
    }

    if (filters.dateFrom) {
      q = q.where("receivedAt", ">=", filters.dateFrom);
    }

    if (filters.dateTo) {
      q = q.where("receivedAt", "<=", filters.dateTo);
    }

    const sortField = filters.sort?.orderBy || "receivedAt";
    const sortDirection = filters.sort?.orderDirection || "desc";
    q = q.orderBy(sortField, sortDirection);

    if (filters.limit) {
      q = q.limit(filters.limit);
    }

    return q;
  }

  static buildBusinessQuery(
    baseRef: FirebaseFirestore.CollectionReference,
    filters: BusinessFilters = {}
  ): FirebaseFirestore.Query {
    let q: FirebaseFirestore.Query = baseRef;

    if (filters.connected !== undefined) {
      q = q.where("connected", "==", filters.connected);
    }

    const sortField = filters.sort?.orderBy || "connectedAt";
    const sortDirection = filters.sort?.orderDirection || "desc";
    q = q.orderBy(sortField, sortDirection);

    if (filters.limit) {
      q = q.limit(filters.limit);
    }

    return q;
  }

  static buildAccountQuery(
    baseRef: FirebaseFirestore.CollectionReference,
    filters: AccountFilters = {}
  ): FirebaseFirestore.Query {
    let q: FirebaseFirestore.Query = baseRef;

    if (filters.email) {
      q = q.where("email", "==", filters.email);
    }

    const sortField = filters.sort?.orderBy || "connectedAt";
    const sortDirection = filters.sort?.orderDirection || "desc";
    q = q.orderBy(sortField, sortDirection);

    if (filters.limit) {
      q = q.limit(filters.limit);
    }

    return q;
  }
}

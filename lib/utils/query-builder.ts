import { query, where, orderBy, limit, Query, DocumentData, CollectionReference, Timestamp } from "firebase/firestore";
import type { ReviewFilters, BusinessFilters, AccountFilters } from "@/lib/types";

export class QueryBuilder {
  static buildReviewQuery(
    baseRef: CollectionReference<DocumentData>,
    filters: ReviewFilters = {}
  ): Query<DocumentData> {
    let q: Query<DocumentData> = baseRef;

    if (filters.replyStatus && filters.replyStatus.length > 0) {
      if (filters.replyStatus.length <= 10) {
        q = query(q, where("replyStatus", "in", filters.replyStatus));
      } else {
        q = query(q, where("replyStatus", "==", filters.replyStatus[0]));
      }
    }

    if (filters.rating && filters.rating.length > 0) {
      if (filters.rating.length <= 10) {
        q = query(q, where("rating", "in", filters.rating));
      } else {
        q = query(q, where("rating", "==", filters.rating[0]));
      }
    }

    if (filters.dateFrom) {
      const timestamp = Timestamp.fromDate(filters.dateFrom);
      q = query(q, where("receivedAt", ">=", timestamp));
    }

    if (filters.dateTo) {
      const timestamp = Timestamp.fromDate(filters.dateTo);
      q = query(q, where("receivedAt", "<=", timestamp));
    }

    if (filters.sort) {
      const sortField = filters.sort.orderBy;
      const sortDirection = filters.sort.orderDirection || "desc";
      q = query(q, orderBy(sortField, sortDirection));
    }

    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    return q;
  }

  static buildBusinessQuery(
    baseRef: CollectionReference<DocumentData>,
    filters: BusinessFilters = {}
  ): Query<DocumentData> {
    let q: Query<DocumentData> = baseRef;

    if (filters.connected !== undefined) {
      q = query(q, where("connected", "==", filters.connected));
    }

    if (filters.sort) {
      const sortField = filters.sort.orderBy;
      const sortDirection = filters.sort.orderDirection || "desc";
      q = query(q, orderBy(sortField, sortDirection));
    }

    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    return q;
  }

  static buildAccountQuery(
    baseRef: CollectionReference<DocumentData>,
    filters: AccountFilters = {}
  ): Query<DocumentData> {
    let q: Query<DocumentData> = baseRef;

    if (filters.email) {
      q = query(q, where("email", "==", filters.email));
    }

    if (filters.sort) {
      const sortField = filters.sort.orderBy;
      const sortDirection = filters.sort.orderDirection || "desc";
      q = query(q, orderBy(sortField, sortDirection));
    }

    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    return q;
  }

  static filterByIds<T extends { id: string }>(results: T[], ids?: string[]): T[] {
    if (!ids || ids.length === 0) return results;
    const idSet = new Set(ids);
    return results.filter((item) => idSet.has(item.id));
  }

  static applyOffset<T>(results: T[], offset?: number): T[] {
    if (!offset || offset === 0) return results;
    return results.slice(offset);
  }
}

export class AdminQueryBuilder {
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

    if (filters.sort) {
      const sortField = filters.sort.orderBy;
      const sortDirection = filters.sort.orderDirection || "desc";
      q = q.orderBy(sortField, sortDirection);
    }

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

    if (filters.sort) {
      const sortField = filters.sort.orderBy;
      const sortDirection = filters.sort.orderDirection || "desc";
      q = q.orderBy(sortField, sortDirection);
    }

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

    if (filters.sort) {
      const sortField = filters.sort.orderBy;
      const sortDirection = filters.sort.orderDirection || "desc";
      q = q.orderBy(sortField, sortDirection);
    }

    if (filters.limit) {
      q = q.limit(filters.limit);
    }

    return q;
  }
}

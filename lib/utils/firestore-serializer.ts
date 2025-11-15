import type { Timestamp } from "firebase-admin/firestore";

function isTimestamp(value: unknown): value is Timestamp {
  return (
    value !== null &&
    typeof value === "object" &&
    "_seconds" in value &&
    "_nanoseconds" in value &&
    typeof (value as any).toDate === "function"
  );
}

export function serializeTimestamp(timestamp: Timestamp | null | undefined): string | null {
  if (!timestamp) return null;
  if (isTimestamp(timestamp)) {
    return timestamp.toDate().toISOString();
  }
  return null;
}

export function serializeDocument<T>(doc: T): T {
  if (doc === null || doc === undefined) {
    return doc;
  }

  if (isTimestamp(doc)) {
    return doc.toDate().toISOString() as unknown as T;
  }

  if (Array.isArray(doc)) {
    return doc.map((item) => serializeDocument(item)) as unknown as T;
  }

  if (typeof doc === "object") {
    const serialized: any = {};
    for (const [key, value] of Object.entries(doc)) {
      serialized[key] = serializeDocument(value);
    }
    return serialized as T;
  }

  return doc;
}

export function serializeDocuments<T>(docs: T[]): T[] {
  return docs.map((doc) => serializeDocument(doc));
}

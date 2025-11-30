interface PostgresError {
  cause?: {
    code?: string | number;
    detail?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function isDuplicateKeyError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const pgError = error as PostgresError;

  if ("code" in pgError && pgError.code === "23505") {
    return true;
  }

  if (pgError.cause && typeof pgError.cause === "object") {
    const cause = pgError.cause as { code?: string | number };
    return cause.code === "23505";
  }

  return false;
}

export function getPostgresErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const pgError = error as PostgresError;

  if ("code" in pgError && typeof pgError.code === "string") {
    return pgError.code;
  }

  if (pgError.cause && typeof pgError.cause === "object") {
    const cause = pgError.cause as { code?: string | number };
    if (typeof cause.code === "string") {
      return cause.code;
    }
  }

  return null;
}

export function getPostgresErrorDetail(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const pgError = error as PostgresError;

  if ("detail" in pgError && typeof pgError.detail === "string") {
    return pgError.detail;
  }

  if (pgError.cause && typeof pgError.cause === "object") {
    const cause = pgError.cause as { detail?: string };
    if (typeof cause.detail === "string") {
      return cause.detail;
    }
  }

  return null;
}

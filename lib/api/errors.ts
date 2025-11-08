export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export function getErrorStatusCode(error: unknown): number {
  if (error instanceof NotFoundError) return 404;
  if (error instanceof ForbiddenError) return 403;
  if (error instanceof BadRequestError) return 400;
  return 500;
}

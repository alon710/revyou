import { BaseRepository } from "@/lib/repositories/base.repository";

/**
 * Base Controller Pattern
 * Provides common business logic and error handling for all entities
 * Sits between API routes and repositories
 */
export abstract class BaseController<TCreate, TEntity, TUpdate> {
  constructor(
    protected repository: BaseRepository<TCreate, TEntity, TUpdate>
  ) {}

  /**
   * Common error handler
   * Wraps repository calls with consistent error handling
   */
  protected async handleError<T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate that an entity exists
   * Throws error if not found
   */
  protected async ensureExists(
    id: string,
    entityName: string
  ): Promise<TEntity> {
    const entity = await this.repository.get(id);
    if (!entity) {
      throw new Error(`${entityName} not found: ${id}`);
    }
    return entity;
  }
}

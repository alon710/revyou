/**
 * Base Repository Pattern
 * Provides common CRUD operations for all entities
 * Subclasses implement entity-specific logic
 */

export abstract class BaseRepository<TCreate, TEntity, TUpdate> {
  constructor(protected basePath: string) {}

  /**
   * Get a single entity by ID
   * @param id - Entity ID
   * @returns Entity or null if not found
   */
  abstract get(id: string): Promise<TEntity | null>;

  /**
   * List entities with optional filtering
   * @param filters - Filter criteria
   * @returns Array of entities
   */
  abstract list(filters?: any): Promise<TEntity[]>;

  /**
   * Create a new entity
   * @param data - Entity creation data
   * @returns Created entity with ID
   */
  abstract create(data: TCreate): Promise<TEntity>;

  /**
   * Update an existing entity
   * @param id - Entity ID
   * @param data - Partial update data
   * @returns Updated entity
   */
  abstract update(id: string, data: TUpdate): Promise<TEntity>;

  /**
   * Delete an entity
   * @param id - Entity ID
   */
  abstract delete(id: string): Promise<void>;
}

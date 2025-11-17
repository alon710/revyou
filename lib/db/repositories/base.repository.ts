import { type TFilters } from "@/lib/types";

/**
 * Base repository interface for all repositories
 * Defines standard CRUD operations
 */
export abstract class BaseRepository<TCreate, TEntity, TUpdate> {
  abstract get(id: string): Promise<TEntity | null>;

  abstract list(filters?: TFilters): Promise<TEntity[]>;

  abstract create(data: TCreate): Promise<TEntity>;

  abstract update(id: string, data: TUpdate): Promise<TEntity>;

  abstract delete(id: string): Promise<void>;
}

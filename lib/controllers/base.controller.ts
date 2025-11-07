import { BaseRepository } from "@/lib/repositories/base.repository";

export abstract class BaseController<TCreate, TEntity, TUpdate> {
  constructor(
    protected repository: BaseRepository<TCreate, TEntity, TUpdate>
  ) {}

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

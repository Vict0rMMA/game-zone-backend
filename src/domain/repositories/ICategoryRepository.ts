import { Category } from '../entities/Category';

export interface PaginationResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ICategoryRepository {
  findAll(page: number, limit: number): Promise<PaginationResult<Category>>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  create(data: Pick<Category, 'name'>): Promise<Category>;
  update(id: string, data: Pick<Category, 'name'>): Promise<Category>;
  delete(id: string): Promise<void>;
}

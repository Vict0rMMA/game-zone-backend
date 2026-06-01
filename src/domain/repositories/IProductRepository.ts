import { Product, ProductWithCategory } from '../entities/Product';
import { PaginationResult } from './ICategoryRepository';

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  type?: string;
}

export interface IProductRepository {
  findAll(page: number, limit: number, filters: ProductFilters): Promise<PaginationResult<ProductWithCategory>>;
  findById(id: string): Promise<ProductWithCategory | null>;
  create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductWithCategory>;
  update(id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProductWithCategory>;
  delete(id: string): Promise<void>;
}
